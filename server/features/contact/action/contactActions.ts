"use server";

// Server Actions for the Contact page, called straight from the page's service (no app/api route).

import { parseContactForm } from "@/app/(view)/(pview)/contact/helper/contactHelper";
import { runAction } from "@/server/core/baseAction";
import { HttpError } from "@/server/core/httpError";
import { contactService } from "../module/contactModule";

/** Saves the message, emails support and the customer, and returns the ticket. Takes the form's fields as form data. */
export async function sendMessage(data: FormData) {
  return runAction(async () => {
    // Same checks and messages as the form in the browser.
    const parsed = parseContactForm(data instanceof FormData ? data : new FormData());
    if (!parsed.ok) throw HttpError.badRequest("Some details need fixing.", parsed.errors);
    return { ticket: await contactService.send(parsed.message) };
  });
}
