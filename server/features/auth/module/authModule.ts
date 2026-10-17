// Wires the auth feature together. Pages call it through the Server Actions in action/authActions.ts
// and the guards in guard/authGuard.ts; the desktop app through app/api/app.

import "server-only";
import { UserRepository } from "@/server/features/user/repository/userRepository";
import { SignInAttemptRepository } from "../repository/signInAttemptRepository";
import { AppAuthService } from "../service/appAuthService";
import { AuthService } from "../service/authService";
import { SignInLimiter } from "../service/signInLimiter";

const users = new UserRepository();

export const authService = new AuthService(users, new SignInLimiter(new SignInAttemptRepository()));

export const appAuthService = new AppAuthService(authService, users);
