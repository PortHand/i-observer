import { authController } from "@/server/features/auth/module/authModule";

export const POST = () => authController.signOut();
