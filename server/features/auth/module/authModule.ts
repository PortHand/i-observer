// Wires the auth feature together. Pages call it through the Server Actions in action/authActions.ts
// and the guards in guard/authGuard.ts.

import "server-only";
import { UserRepository } from "@/server/features/user/repository/userRepository";
import { AuthService } from "../service/authService";

export const authService = new AuthService(new UserRepository());
