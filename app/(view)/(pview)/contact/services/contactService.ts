// API calls for the Contact page. There is no backend yet, so this is a placeholder: it succeeds
// locally without sending anything. Replace it before relying on the form.

import type { ContactMessage } from "../helper/contactHelper";

export type SendMessageResult = { ok: true; ticket: string } | { ok: false; error: string };

export const sendMessage = async (message: ContactMessage): Promise<SendMessageResult> => {
  // TODO: replace with a call to the real support API (or an email service), which should issue the ticket.
  void message;
  const ticket = `T-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  return { ok: true, ticket };
};
