import "server-only";
import { HttpError } from "./httpError";

// Route Handlers (app/api) answer with JSON: the data on success, { error, fields?, retryAfter? }
// with the HttpError's status on failure. Like Server Actions, their input comes from anyone, so
// validate it. Responses are never cached: they carry account data.

const NO_STORE = { "Cache-Control": "no-store" };

/** Largest JSON body readJson accepts. */
const MAX_BODY_BYTES = 8 * 1024;

/** Runs a handler, turning thrown errors into a JSON error response. */
export const runRoute = async (handler: () => Promise<object>, status = 200): Promise<Response> => {
  try {
    return Response.json(await handler(), { status, headers: NO_STORE });
  } catch (error) {
    if (error instanceof HttpError) {
      const { status: errorStatus, message, fields, retryAfter } = error;
      return Response.json(
        { error: message, ...(fields && { fields }), ...(retryAfter !== undefined && { retryAfter }) },
        {
          status: errorStatus,
          headers: { ...NO_STORE, ...(retryAfter !== undefined && { "Retry-After": String(retryAfter) }) },
        },
      );
    }
    console.error(error);
    return Response.json(
      { error: "Something went wrong on our side. Please try again in a minute." },
      { status: 500, headers: NO_STORE },
    );
  }
};

/** The request's JSON object body. A 400 when it isn't JSON, is too large or isn't an object. */
export const readJson = async (request: Request): Promise<Record<string, unknown>> => {
  const invalid = () => HttpError.badRequest("Send the details as a JSON object.");
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw invalid();
  // Refuse a declared oversize body before reading it; the length check below covers the rest.
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) throw invalid();
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) throw invalid();
  try {
    const body: unknown = JSON.parse(text);
    if (typeof body !== "object" || body === null || Array.isArray(body)) throw invalid();
    return body as Record<string, unknown>;
  } catch {
    throw invalid();
  }
};

/** The token from an "Authorization: Bearer <token>" header, or undefined. */
export const bearerToken = (request: Request): string | undefined => {
  const match = /^Bearer ([A-Za-z0-9._-]+)$/.exec(request.headers.get("authorization") ?? "");
  return match?.[1];
};
