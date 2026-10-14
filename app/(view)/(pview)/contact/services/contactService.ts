// API calls for the Contact page.

import { http } from "@/helper/http";
import { HttpError } from "@/helper/httpError";
import { apiRoutes } from "@/helper/route";
import type { ContactField, ContactMessage } from "../helper/contactHelper";

export type SendMessageResult =
  | { ok: true; ticket: string }
  | { ok: false; error: string; fields?: Partial<Record<ContactField, string>> };

/** Saves the message and emails it to support. The server issues the ticket and re-checks every field. */
export const sendMessage = async (message: ContactMessage): Promise<SendMessageResult> => {
  const body = new FormData();
  for (const [field, value] of Object.entries(message)) body.set(field, value);

  try {
    const { ticket } = await http.post<{ ticket: string }>(apiRoutes.contact, body, "form");
    return { ok: true, ticket };
  } catch (error) {
    if (!(error instanceof HttpError)) throw error;
    // On a 400 the API lists the fields it rejected, so they can be shown next to each input.
    const { fields } = (error.data ?? {}) as { fields?: Partial<Record<ContactField, string>> };
    return { ok: false, error: error.message, fields };
  }
};
