import { contactController } from "@/server/features/contact/module/contactModule";

export const POST = (request: Request) => contactController.send(request);
