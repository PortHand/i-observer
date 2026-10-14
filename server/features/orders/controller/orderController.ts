import "server-only";
import type { PlanId } from "@/app/(view)/(pview)/get-iobserver/content/getContent";
import {
  isValidEmail,
  isValidPhone,
  isValidScreenshot,
  isValidUtr,
  normalizePhone,
  normalizeUtr,
} from "@/app/(view)/(pview)/get-iobserver/helper/getHelper";
import { isValidReference, normalizeReference } from "@/app/(view)/(pview)/contact/helper/contactHelper";
import { BaseController } from "@/server/core/baseController";
import { HttpError, type FieldErrors } from "@/server/core/httpError";
import type { OrderService } from "../service/orderService";

export class OrderController extends BaseController {
  private readonly service: OrderService;

  constructor(service: OrderService) {
    super();
    this.service = service;
  }

  /** POST /api/orders with JSON { planId, email, phone }. */
  create(request: Request) {
    return this.handle(async () => {
      const body = await this.readJson(request);
      const planId = String(body.planId ?? "") as PlanId;
      const email = String(body.email ?? "").trim().toLowerCase();
      const phone = normalizePhone(String(body.phone ?? ""));

      const fields: FieldErrors = {};
      if (!planId) fields.planId = "Choose a plan.";
      if (!isValidEmail(email)) fields.email = "Enter a valid email address.";
      if (!isValidPhone(phone)) fields.phone = "Enter a 10-digit Indian mobile number.";
      this.assertValid(fields);

      const order = await this.service.createOrder({ planId, email, phone });
      return this.ok({ order }, 201);
    });
  }

  /** POST /api/orders/{reference}/transaction with form data: utr, and optionally a screenshot file. */
  submitTransaction(request: Request, rawReference: string) {
    return this.handle(async () => {
      const reference = normalizeReference(decodeURIComponent(rawReference));
      if (!isValidReference(reference)) throw HttpError.notFound("That isn't a valid order reference.");

      const form = await this.readForm(request);
      const utr = normalizeUtr(String(form.get("utr") ?? ""));
      const upload = form.get("screenshot");
      const screenshot = upload instanceof File && upload.size > 0 ? upload : null;

      const fields: FieldErrors = {};
      if (!isValidUtr(utr)) fields.utr = "The UTR is the 12-digit number in your UPI app's payment details.";
      if (screenshot && !isValidScreenshot(screenshot)) fields.screenshot = "Attach a PNG or JPEG under 5 MB.";
      this.assertValid(fields);

      const order = await this.service.submitTransaction(reference, { utr, screenshot });
      return this.ok({ submittedAt: order.paymentSubmittedAt?.toISOString() });
    });
  }
}
