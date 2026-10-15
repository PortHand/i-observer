// Wires the account feature together: the signed-in customer's own view of their access, orders
// and feedback, for the welcome and profile pages. The download feature asks it who may download.

import "server-only";
import { feedbackService } from "@/server/features/feedback/module/feedbackModule";
import { OrderRepository } from "@/server/features/order/repository/orderRepository";
import { pricingService } from "@/server/features/pricing/module/pricingModule";
import { userService } from "@/server/features/user/module/userModule";
import { AccountService } from "../service/accountService";

export const accountService = new AccountService(userService, new OrderRepository(), pricingService, feedbackService);
