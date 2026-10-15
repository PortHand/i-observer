import "server-only";

export interface StorageSettings {
  /** Supabase project URL, e.g. https://<project-ref>.supabase.co. */
  url?: string;
  /** Secret (or legacy service_role) key: bypasses row-level security, so it stays on the server. */
  secretKey?: string;
  bucket: string;
  /** Development without settings: log and skip uploads instead of failing. */
  optional: boolean;
  /** TO_TEST=true: print what would be saved instead of uploading. */
  testMode: boolean;
}

/**
 * A path with each segment URL-encoded, keeping the slashes between them. "@" stays as is: Supabase
 * signs the path as written, so a link to client/a%40b.com/… fails with "Invalid signature".
 */
const encodePath = (path: string) =>
  path
    .split("/")
    .map((segment) => encodeURIComponent(segment).replace(/%40/g, "@"))
    .join("/");

/**
 * Files in one private Supabase Storage bucket, through its HTTP API. Uploads are server-side with
 * the service_role key; reading back goes through short-lived signed links.
 */
export class StorageService {
  private readonly settings: StorageSettings;

  constructor(settings: StorageSettings) {
    this.settings = settings;
  }

  get configured() {
    return Boolean(this.settings.url && this.settings.secretKey);
  }

  /**
   * Saves `bytes` at `path` in the bucket, replacing a file already there. Returns the path, or
   * null when nothing was stored: in test mode (printed instead), or in development when Supabase
   * isn't set up (skipped and logged). Null keeps orders from pointing at files that don't exist.
   */
  async upload(path: string, bytes: Uint8Array, contentType: string): Promise<string | null> {
    if (this.settings.testMode) {
      console.log(`[storage] TO_TEST: saved ${this.settings.bucket}/${path} (${contentType}, ${bytes.byteLength} bytes). Not uploaded.`);
      return null;
    }
    if (!this.configured) {
      if (this.settings.optional) {
        console.warn(`[storage] SUPABASE_URL / SUPABASE_SECRET_KEY not set: skipped uploading ${path}.`);
        return null;
      }
      throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set to store receipts.");
    }
    const response = await this.request(`/object/${this.settings.bucket}/${encodePath(path)}`, {
      method: "POST",
      headers: { "Content-Type": contentType, "x-upsert": "true", "Cache-Control": "max-age=3600" },
      body: Buffer.from(bytes),
    });
    if (!response.ok) throw new Error(`Upload of ${path} failed: ${response.status} ${await response.text()}`);
    return path;
  }

  /**
   * A link to the file that works for `expiresIn` seconds, or null when it can't be made (e.g. no
   * file at `path`). With `downloadAs`, the browser saves it under that name instead of opening it.
   */
  async signedUrl(path: string, expiresIn: number, downloadAs?: string): Promise<string | null> {
    if (!this.configured) return null;
    try {
      const response = await this.request(`/object/sign/${this.settings.bucket}/${encodePath(path)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiresIn }),
      });
      if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
      const { signedURL } = (await response.json()) as { signedURL?: string };
      if (!signedURL) return null;
      const download = downloadAs ? `&download=${encodeURIComponent(downloadAs)}` : "";
      return `${this.settings.url}/storage/v1${signedURL}${download}`;
    } catch (error) {
      console.error(`[storage] Couldn't sign a link to ${path}:`, error);
      return null;
    }
  }

  private request(endpoint: string, init: RequestInit) {
    const key = this.settings.secretKey!;
    return fetch(`${this.settings.url}/storage/v1${endpoint}`, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${key}`, apikey: key },
      cache: "no-store",
    });
  }
}
