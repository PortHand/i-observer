import "server-only";
import { parseContactForm } from "@/app/(view)/(pview)/contact/helper/contactHelper";
import { BaseController } from "@/server/core/baseController";
import { HttpError } from "@/server/core/httpError";
import type { ContactService } from "../service/contactService";

export class ContactController extends BaseController {
  private readonly service: ContactService;

  constructor(service: ContactService) {
    super();
    this.service = service;
  }

  /** POST /api/contact with the contact form's fields as form data. */
  send(request: Request) {
    return this.handle(async () => {
      // Same checks and messages as the form in the browser.
      const parsed = parseContactForm(await this.readForm(request));
      if (!parsed.ok) throw HttpError.badRequest("Some details need fixing.", parsed.errors);
      return this.ok({ ticket: await this.service.send(parsed.message) }, 201);
    });
  }
}
