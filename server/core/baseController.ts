import "server-only";
import { HttpError, type FieldErrors } from "./httpError";

// Responses use the same result shape as the page services: { ok: true, ... } or
// { ok: false, error, fields? }, so a service can return the parsed body as it is.

export abstract class BaseController {
  /** Runs a request handler, turning thrown errors into JSON error responses. */
  protected async handle(action: () => Promise<Response>): Promise<Response> {
    try {
      return await action();
    } catch (error) {
      if (error instanceof HttpError) return this.fail(error.status, error.message, error.fields);
      console.error(error);
      return this.fail(500, "Something went wrong on our side. Please try again in a minute.");
    }
  }

  protected ok(data: object, status = 200) {
    return Response.json({ ok: true, ...data }, { status });
  }

  protected fail(status: number, error: string, fields?: FieldErrors) {
    return Response.json({ ok: false, error, ...(fields && { fields }) }, { status });
  }

  protected async readJson(request: Request): Promise<Record<string, unknown>> {
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw HttpError.badRequest("Expected a JSON object.");
    return body as Record<string, unknown>;
  }

  protected async readForm(request: Request): Promise<FormData> {
    return request.formData().catch(() => {
      throw HttpError.badRequest("Expected form data.");
    });
  }

  /** Throws a 400 listing every invalid field, if there are any. */
  protected assertValid(fields: FieldErrors) {
    if (Object.keys(fields).length > 0) throw HttpError.badRequest("Some details need fixing.", fields);
  }
}
