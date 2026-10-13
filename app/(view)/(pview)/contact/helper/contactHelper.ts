import { routes } from "@/helper/route";
import {
  MESSAGE_MAX,
  MESSAGE_MIN,
  form,
  sectionIds,
  topics,
  topicsRequiringReference,
  type TopicId,
} from "../content/contactContent";
import { isValidEmail, isValidPhone, normalizePhone } from "../../get-iobserver/helper/getHelper";

export type ContactField = "name" | "email" | "phone" | "topic" | "reference" | "message";

export interface ContactMessage {
  name: string;
  email: string;
  /** 10-digit Indian mobile number, or "" when left blank. */
  phone: string;
  topic: TopicId;
  /** Order reference such as IOB-AB12CD, or "" when left blank. */
  reference: string;
  message: string;
}

const isTopic = (value: string): value is TopicId => topics.some(({ id }) => id === value);

/** "iob ab12cd" → "IOB-AB12CD". */
export const normalizeReference = (reference: string) => {
  const code = reference.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^IOB/, "");
  return code ? `IOB-${code}` : "";
};

const isValidReference = (reference: string) => /^IOB-[A-Z0-9]{6}$/.test(reference);

/** Form fields another page can fill in through the URL, e.g. the checkout success screen. */
export interface ContactPrefill {
  topic?: TopicId;
  reference?: string;
  email?: string;
  message?: string;
}

/** Link to the contact form with fields filled in, scrolled to the form. */
export const contactLink = (prefill: ContactPrefill) => {
  const entries = Object.entries(prefill).filter((entry): entry is [string, string] => Boolean(entry[1]));
  const query = new URLSearchParams(entries).toString();
  return `${routes.contact}${query ? `?${query}` : ""}#${sectionIds.message}`;
};

/** Reads a prefill back from the URL, dropping anything invalid. */
export const readPrefill = (search: string): ContactPrefill => {
  const params = new URLSearchParams(search);
  const topic = params.get("topic") ?? "";
  const reference = normalizeReference(params.get("reference") ?? "");
  const email = (params.get("email") ?? "").trim().toLowerCase();
  const message = (params.get("message") ?? "").trim().slice(0, MESSAGE_MAX);
  return {
    ...(isTopic(topic) && { topic }),
    ...(isValidReference(reference) && { reference }),
    ...(isValidEmail(email) && { email }),
    ...(message && { message }),
  };
};

/** Reads and checks the form. Returns the cleaned message, or an error per invalid field. */
export const parseContactForm = (
  data: FormData,
): { ok: true; message: ContactMessage } | { ok: false; errors: Partial<Record<ContactField, string>> } => {
  const read = (key: ContactField) => String(data.get(key) ?? "").trim();
  const name = read("name");
  const email = read("email").toLowerCase();
  const phone = read("phone") ? normalizePhone(read("phone")) : "";
  const topic = read("topic");
  const reference = normalizeReference(read("reference"));
  const message = read("message");
  const { errors: text } = form;

  const errors: Partial<Record<ContactField, string>> = {};
  if (!name) errors.name = text.name;
  if (!isValidEmail(email)) errors.email = text.email;
  if (phone && !isValidPhone(phone)) errors.phone = text.phone;
  if (!isTopic(topic)) errors.topic = text.topic;
  if (!reference && isTopic(topic) && topicsRequiringReference.includes(topic)) errors.reference = text.referenceMissing;
  else if (reference && !isValidReference(reference)) errors.reference = text.reference;
  if (message.length < MESSAGE_MIN) errors.message = text.messageShort;
  else if (message.length > MESSAGE_MAX) errors.message = text.messageLong;

  if (Object.keys(errors).length > 0 || !isTopic(topic)) return { ok: false, errors };
  return { ok: true, message: { name, email, phone, topic, reference, message } };
};
