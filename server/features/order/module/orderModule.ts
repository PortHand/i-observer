// Wires the order feature together. The checkout calls it through the Server Actions in
// action/orderActions.ts; the admin portal through action/orderReviewActions.ts.

import "server-only";
import { entitlementService } from "@/server/features/entitlement/module/entitlementModule";
import { mailService } from "@/server/features/mail/module/mailModule";
import { pricingService } from "@/server/features/pricing/module/pricingModule";
import { otpService } from "@/server/features/otp/module/otpModule";
import { userService } from "@/server/features/user/module/userModule";
import { OrderRepository } from "../repository/orderRepository";
import { OrderReviewService } from "../service/orderReviewService";
import { OrderService } from "../service/orderService";

const orderRepository = new OrderRepository();

export const orderService = new OrderService(
  orderRepository,
  pricingService,
  otpService,
  userService,
  entitlementService,
);

export const orderReviewService = new OrderReviewService(orderRepository, orderService, pricingService, userService, mailService);
