// Wires the contact feature together. The route handler in app/api/contact uses contactController.

import "server-only";
import { mailService } from "@/server/features/mail/module/mailModule";
import { ContactController } from "../controller/contactController";
import { ContactRepository } from "../repository/contactRepository";
import { ContactService } from "../service/contactService";

export const contactController = new ContactController(new ContactService(new ContactRepository(), mailService));
