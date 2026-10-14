// Error thrown by the http client (helper/http.ts) for every failed request.

export type HttpErrorCode = "HttpError" | "NetworkError" | "TimeoutError";

export class HttpError extends Error {
  /** HttpError: the server answered with an error status. NetworkError / TimeoutError: no answer. */
  code: HttpErrorCode;
  /** HTTP status, or 0 when the server never answered. */
  statusCode: number;
  /** Parsed response body, e.g. { ok: false, error, fields } from our API routes. */
  data: unknown;

  constructor(message: string, code: HttpErrorCode, statusCode = 500, data: unknown = null) {
    super(message);

    this.name = "HttpError";
    this.code = code;
    this.statusCode = statusCode;
    this.data = data;
  }
}
