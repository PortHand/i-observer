// Wires the contact feature together. The Contact page calls it through the Server Actions in
// action/contactActions.ts.

import "server-only";
import { mailService } from "@/server/features/mail/module/mailModule";
import { ContactRepository } from "../repository/contactRepository";
import { ContactService } from "../service/contactService";

export const contactService = new ContactService(new ContactRepository(), mailService);
