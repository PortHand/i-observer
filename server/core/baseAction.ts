import "server-only";
import { HttpError, type FieldErrors } from "./httpError";

// Server Actions answer with the same result shape as the page services: { ok: true, ...data } or
// { ok: false, error, fields? }. Their arguments come straight from the browser, so validate them.

export type ActionFailure = { ok: false; error: string; fields?: FieldErrors; retryAfter?: number };

export type ActionResult<T extends object> = ({ ok: true } & T) | ActionFailure;

/** Runs an action, turning thrown errors into a failed result the page can show. */
export const runAction = async <T extends object>(action: () => Promise<T>): Promise<ActionResult<T>> => {
  try {
    return { ok: true, ...(await action()) };
  } catch (error) {
    if (error instanceof HttpError) {
      const { message, fields, retryAfter } = error;
      return { ok: false, error: message, ...(fields && { fields }), ...(retryAfter !== undefined && { retryAfter }) };
    }
    console.error(error);
    return { ok: false, error: "Something went wrong on our side. Please try again in a minute." };
  }
};

/** Throws a 400 listing every invalid field, if there are any. */
export const assertValid = (fields: FieldErrors) => {
  if (Object.keys(fields).length > 0) throw HttpError.badRequest("Some details need fixing.", fields);
};
