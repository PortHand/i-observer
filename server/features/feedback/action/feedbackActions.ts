"use server";

// Server Actions for the profile page's feedback form, called straight from the page's service.

import { parseFeedbackForm } from "@/app/(view)/sview/profile/helper/profileHelper";
import { runAction } from "@/server/core/baseAction";
import { HttpError } from "@/server/core/httpError";
import { getCurrentUser } from "@/server/features/auth/guard/authGuard";
import { feedbackService } from "../module/feedbackModule";

/** Saves the signed-in customer's feedback. Takes the form's fields as form data. */
export async function sendFeedback(data: FormData) {
  return runAction(async () => {
    const user = await getCurrentUser();
    if (!user) throw HttpError.unauthorized("Your session has ended. Sign in again.");
    // Same checks and messages as the form in the browser.
    const parsed = parseFeedbackForm(data instanceof FormData ? data : new FormData());
    if (!parsed.ok) throw HttpError.badRequest("Some details need fixing.", parsed.errors);
    return { feedback: await feedbackService.send(user, parsed.input) };
  });
}
