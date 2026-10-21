// Every environment variable the server reads, in one place. See .env.example for what each does.
//
//   import { env } from "@/server/core/env";
//   if (env.toTest) …
//
// Values are getters, read when used rather than on import, so `next build` works without them and
// drizzle-kit (which loads the .env files after importing its config) sees the right ones. No
// "server-only", "@/" alias or imports here: databaseConfig.ts imports this, drizzle-kit runs it,
// and scripts/seed-admin.mjs loads it with plain Node.
// Browser code can't use this file; it reads NEXT_PUBLIC_* variables directly (see helper/http.ts).

/** The variable's value, or undefined when it's unset or empty. */
const optional = (name: string): string | undefined => process.env[name] || undefined;

/** "true" turns a flag on; unset or empty keeps the default. */
const flag = (name: string, fallback = false): boolean => {
  const value = optional(name);
  return value === undefined ? fallback : value === "true";
};

const MAIL_BCC_PREFIX = "MAIL_BCC_";

export const env = {
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },

  /** TO_TEST=true: OTPs and payment screenshots are printed to the server log instead of being sent or stored. */
  get toTest() {
    return flag("TO_TEST");
  },

  /** Public address of the site, for absolute links in emails. */
  get siteUrl() {
    return (optional("SITE_URL") ?? "https://i-overlay.com").replace(/\/$/, "");
  },

  /** Search console ownership tokens: the content of each <meta> tag the console asks for. */
  verification: {
    /** Google Search Console: GOOGLE_SITE_VERIFICATION. */
    get google() {
      return optional("GOOGLE_SITE_VERIFICATION")?.trim();
    },
    /** Bing Webmaster Tools (also covers Yahoo and DuckDuckGo): BING_SITE_VERIFICATION. */
    get bing() {
      return optional("BING_SITE_VERIFICATION")?.trim();
    },
    /** Yandex Webmaster: YANDEX_VERIFICATION. */
    get yandex() {
      return optional("YANDEX_VERIFICATION")?.trim();
    },
    /** Pinterest: PINTEREST_VERIFICATION. */
    get pinterest() {
      return optional("PINTEREST_VERIFICATION")?.trim();
    },
    /** Meta Business Suite: FACEBOOK_DOMAIN_VERIFICATION. */
    get facebook() {
      return optional("FACEBOOK_DOMAIN_VERIFICATION")?.trim();
    },
  },

  /** Signs the sign-in cookie. At least 32 characters; changing it signs everyone out. */
  get sessionSecret() {
    return optional("SESSION_SECRET");
  },

  /** The admin account `npm run db:seed-admin` creates or updates. Not read by the running app. */
  admin: {
    /** Login name. Default "admin". */
    get username() {
      return (optional("ADMIN_USERNAME") ?? "admin").trim().toLowerCase();
    },
    get email() {
      return optional("ADMIN_EMAIL")?.trim().toLowerCase();
    },
    /** Unique and required on every account; admins don't buy, so a placeholder is fine. */
    get phone() {
      return (optional("ADMIN_PHONE") ?? "0000000000").trim();
    },
    get password() {
      return optional("ADMIN_PASSWORD");
    },
  },

  /** Supabase Storage, for payment receipts, app installers and site media. Without url and secret key, development skips uploads and production refuses them. */
  supabase: {
    /** Project URL, e.g. https://<project-ref>.supabase.co. */
    get url() {
      return optional("SUPABASE_URL")?.replace(/\/$/, "");
    },
    /**
     * Secret key (sb_secret_…), or the legacy service_role key: full access, so server only. Never
     * NEXT_PUBLIC_, and never the publishable key, which can't write to a private bucket.
     */
    get secretKey() {
      return optional("SUPABASE_SECRET_KEY") ?? optional("SUPABASE_SERVICE_ROLE_KEY");
    },
    /** Private bucket holding the receipts. */
    get receiptsBucket() {
      return optional("SUPABASE_RECEIPTS_BUCKET") ?? "i-overlay";
    },
    /** Private bucket holding the app installers, under releases/<version>/. Defaults to the receipts bucket. */
    get downloadsBucket() {
      return optional("SUPABASE_DOWNLOADS_BUCKET") ?? env.supabase.receiptsBucket;
    },
    /** Private bucket holding site media such as the intro video, under assets/. Defaults to the receipts bucket. */
    get assetsBucket() {
      return optional("SUPABASE_ASSETS_BUCKET") ?? env.supabase.receiptsBucket;
    },
  },

  /** AWS S3, for the app installers when S3_BUCKET and both keys are set. See .env.example. */
  s3: {
    /** The bucket's region, e.g. ap-south-1 (Mumbai). */
    get region() {
      return optional("S3_REGION")?.trim() ?? "ap-south-1";
    },
    /** Private bucket holding the installers, under releases/<version>/. */
    get bucket() {
      return optional("S3_BUCKET")?.trim();
    },
    /** Folder in the bucket the installers' releases/ folder is under; S3_PREFIX="" for the root. */
    get prefix() {
      return (process.env.S3_PREFIX ?? "i-overlay/app").trim().replace(/^\/+|\/+$/g, "");
    },
    /** An IAM user's access key that may read the bucket (s3:GetObject). */
    get accessKeyId() {
      return optional("S3_ACCESS_KEY_ID")?.trim();
    },
    /** The same key's secret: server only, never NEXT_PUBLIC_. */
    get secretAccessKey() {
      return optional("S3_SECRET_ACCESS_KEY")?.trim();
    },
  },

  /** Postgres connection. databaseConfig.ts checks the required ones and builds the URL. */
  db: {
    get host() {
      return optional("DB_HOST");
    },
    get port() {
      return optional("DB_PORT") ?? "5432";
    },
    get user() {
      return optional("DB_USER");
    },
    /** May be empty, for local Postgres set up without one. */
    get password() {
      return optional("DB_PASSWORD");
    },
    get name() {
      return optional("DB_NAME");
    },
    get ssl() {
      return flag("DB_SSL");
    },
    /**
     * Most connections each server instance keeps open. Every serverless instance has its own pool,
     * so in production this stays small: instances × poolMax must fit the database pooler's limit.
     */
    get poolMax() {
      const value = Number(optional("DB_POOL_MAX"));
      return Number.isInteger(value) && value > 0 ? value : env.isProduction ? 3 : 10;
    },
  },

  /** Outgoing email. Without smtp.host, development prints emails and production refuses to send. */
  mail: {
    smtp: {
      get host() {
        return optional("SMTP_HOST");
      },
      get port() {
        return Number(optional("SMTP_PORT") ?? 587);
      },
      /** SMTP_SECURE when set; otherwise TLS from the start only on port 465. */
      get secure() {
        return flag("SMTP_SECURE", env.mail.smtp.port === 465);
      },
      get user() {
        return optional("SMTP_USER");
      },
      get password() {
        return optional("SMTP_PASSWORD");
      },
    },
    get from() {
      return optional("MAIL_FROM");
    },
    get supportInbox() {
      return optional("SUPPORT_INBOX");
    },
    /** MAIL_BCC: comma-separated addresses copied on every email. */
    get bcc() {
      return optional("MAIL_BCC");
    },
    /** MAIL_BCC_<FEATURE> variables, keyed by lower-cased feature: MAIL_BCC_CONTACT → { contact: "…" }. */
    get bccByFeature(): Record<string, string> {
      return Object.fromEntries(
        Object.entries(process.env)
          .filter((entry): entry is [string, string] => entry[0].startsWith(MAIL_BCC_PREFIX) && Boolean(entry[1]))
          .map(([name, value]) => [name.slice(MAIL_BCC_PREFIX.length).toLowerCase(), value]),
      );
    },
  },
};
