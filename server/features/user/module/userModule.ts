// Wires the user feature together. The order feature takes userService in its constructor.

import "server-only";
import { UserRepository } from "../repository/userRepository";
import { UserService } from "../service/userService";

export const userService = new UserService(new UserRepository());
