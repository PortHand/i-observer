// Server calls for the Contact page. They are Server Actions
// (server/features/contact/action/contactActions.ts), so there's no API route.

import * as contactActions from "@/server/features/contact/action/contactActions";
import type { ContactField, ContactMessage } from "../helper/contactHelper";

export type SendMessageResult =
  | { ok: true; ticket: string }
  | { ok: false; error: string; fields?: Partial<Record<ContactField, string>> };

/** Saves the message and emails it to support. The server issues the ticket and re-checks every field. */
export const sendMessage = async (message: ContactMessage): Promise<SendMessageResult> => {
  const body = new FormData();
  for (const [field, value] of Object.entries(message)) body.set(field, value);
  // On failure the server lists the fields it rejected, so they can be shown next to each input.
  return (await contactActions.sendMessage(body)) as SendMessageResult;
};
