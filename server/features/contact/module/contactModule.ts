// Wires the contact feature together. The route handler in app/api/contact uses contactController.

import "server-only";
import { ContactController } from "../controller/contactController";
import { ContactRepository } from "../repository/contactRepository";
import { ContactService } from "../service/contactService";

export const contactController = new ContactController(new ContactService(new ContactRepository()));
