import { authController } from "@/server/features/auth/module/authModule";

export const GET = () => authController.getSession();
