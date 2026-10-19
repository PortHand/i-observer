import "server-only";
import { createHash, createHmac } from "node:crypto";
import type { SignedLinks } from "./storageService";

export interface S3Settings {
  /** The bucket's AWS region, e.g. "ap-south-1". */
  region: string;
  bucket?: string;
  /** Folder inside the bucket that paths are under, e.g. "i-overlay/app"; "" for the bucket's root. */
  prefix: string;
  /** An IAM user's access key, allowed s3:GetObject on the bucket. */
  accessKeyId?: string;
  secretAccessKey?: string;
}

/** An AWS access key ID: "AKIA…" for an IAM user, "ASIA…" for temporary credentials. */
const ACCESS_KEY_ID_PATTERN = /^A[KS]IA[A-Z0-9]{16}$/;

/** Longest a link may work, whatever the caller asks for: installer links shouldn't be passed around. */
const MAX_EXPIRES_SECONDS = 30 * 60;

/** RFC 3986 encoding, as AWS Signature Version 4 requires: encodeURIComponent leaves !'()* alone. */
const encode = (value: string) => encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const hmac = (key: Buffer | string, value: string) => createHmac("sha256", key).update(value).digest();

/**
 * Files in one private AWS S3 bucket, read through short-lived presigned links (Signature Version
 * 4, signed here without the AWS SDK). Used for the app installers, which are larger than
 * Supabase's free upload limit. Uploads are by hand in the AWS console, so this only signs links.
 */
export class S3Storage implements SignedLinks {
  private readonly settings: S3Settings;

  constructor(settings: S3Settings) {
    this.settings = settings;
  }

  /**
   * The access key ID goes into every link in plain text, so one that doesn't look like an ID (e.g.
   * the secret, with the two swapped in .env) is refused rather than handed out.
   */
  private get validKeyId() {
    const valid = ACCESS_KEY_ID_PATTERN.test(this.settings.accessKeyId ?? "");
    if (!valid) console.error("[storage] S3_ACCESS_KEY_ID isn't an AWS access key ID (AKIA…): no download links are made. Check it isn't swapped with S3_SECRET_ACCESS_KEY.");
    return valid;
  }

  get configured() {
    return Boolean(this.settings.bucket && this.settings.accessKeyId && this.settings.secretAccessKey);
  }

  /**
   * A link to the file that works for `expiresIn` seconds, or null when S3 isn't set up. With
   * `downloadAs`, the browser saves it under that name. Signing doesn't check the file exists: a
   * missing one answers 403/404 when the link is opened.
   */
  async signedUrl(path: string, expiresIn: number, downloadAs?: string): Promise<string | null> {
    if (!this.configured || !this.validKeyId) return null;
    const { region, bucket, prefix, accessKeyId, secretAccessKey } = this.settings as Required<S3Settings>;
    const key = prefix ? `${prefix}/${path}` : path;

    // Virtual-hosted style: the bucket in the host name, the file in the path.
    const host = `${bucket}.s3.${region}.amazonaws.com`;
    const amzDate = new Date().toISOString().replace(/[-:]|\.\d{3}/g, ""); // 20261019T120000Z
    const day = amzDate.slice(0, 8);
    const scope = `${day}/${region}/s3/aws4_request`;
    const canonicalPath = `/${key.split("/").map(encode).join("/")}`;

    const params: Record<string, string> = {
      "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
      "X-Amz-Credential": `${accessKeyId}/${scope}`,
      "X-Amz-Date": amzDate,
      "X-Amz-Expires": String(Math.min(Math.max(1, Math.round(expiresIn)), MAX_EXPIRES_SECONDS)),
      "X-Amz-SignedHeaders": "host",
      ...(downloadAs && { "response-content-disposition": `attachment; filename="${downloadAs.replace(/"/g, "")}"` }),
    };
    const query = Object.keys(params)
      .sort()
      .map((key) => `${encode(key)}=${encode(params[key])}`)
      .join("&");

    const canonicalRequest = ["GET", canonicalPath, query, `host:${host}\n`, "host", "UNSIGNED-PAYLOAD"].join("\n");
    const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256(canonicalRequest)].join("\n");
    const signingKey = hmac(hmac(hmac(hmac(`AWS4${secretAccessKey}`, day), region), "s3"), "aws4_request");
    const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");

    return `https://${host}${canonicalPath}?${query}&X-Amz-Signature=${signature}`;
  }
}
