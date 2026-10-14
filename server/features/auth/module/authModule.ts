// Wires the auth feature together. Route handlers in app/api/auth use authController.

import "server-only";
import { AuthController } from "../controller/authController";
import { PasswordHasher } from "../helper/passwordHasher";
import { SessionRepository } from "../repository/sessionRepository";
import { UserRepository } from "../repository/userRepository";
import { AuthService } from "../service/authService";

export const authService = new AuthService(new UserRepository(), new SessionRepository(), new PasswordHasher());
export const authController = new AuthController(authService);
