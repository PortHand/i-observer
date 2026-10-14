// Wires the order feature together. The checkout calls it through the Server Actions in
// action/orderActions.ts.

import "server-only";
import { pricingService } from "@/server/features/pricing/module/pricingModule";
import { otpService } from "@/server/features/otp/module/otpModule";
import { userService } from "@/server/features/user/module/userModule";
import { OrderRepository } from "../repository/orderRepository";
import { OrderService } from "../service/orderService";

export const orderService = new OrderService(new OrderRepository(), pricingService, otpService, userService);
