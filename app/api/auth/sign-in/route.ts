import { authController } from "@/server/features/auth/module/authModule";

export const POST = (request: Request) => authController.signIn(request);
