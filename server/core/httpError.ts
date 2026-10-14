/** Field name → message, shown next to the matching form field. */
export type FieldErrors = Partial<Record<string, string>>;

/** An error the client caused or should see. runAction (baseAction.ts) turns it into a failed result. */
export class HttpError extends Error {
  readonly status: number;
  readonly fields?: FieldErrors;
  /** For 429s: seconds until the request may be retried, so the page can show a countdown. */
  readonly retryAfter?: number;
  /** Machine-readable reason the page can act on, e.g. "verification_required" opens the OTP modal. */
  readonly code?: string;

  constructor(status: number, message: string, fields?: FieldErrors, extra: { retryAfter?: number; code?: string } = {}) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.fields = fields;
    this.retryAfter = extra.retryAfter;
    this.code = extra.code;
  }

  static badRequest(message: string, fields?: FieldErrors) {
    return new HttpError(400, message, fields);
  }

  static unauthorized(message: string) {
    return new HttpError(401, message);
  }

  static notFound(message: string) {
    return new HttpError(404, message);
  }

  static conflict(message: string) {
    return new HttpError(409, message);
  }

  static tooManyRequests(message: string, retryAfter?: number) {
    return new HttpError(429, message, undefined, { retryAfter });
  }
}
