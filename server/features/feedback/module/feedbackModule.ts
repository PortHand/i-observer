// Wires the feedback feature together. The profile page sends feedback through the Server Action
// in action/feedbackActions.ts and lists it through the account feature.

import "server-only";
import { mailService } from "@/server/features/mail/module/mailModule";
import { OrderRepository } from "@/server/features/order/repository/orderRepository";
import { FeedbackRepository } from "../repository/feedbackRepository";
import { FeedbackService } from "../service/feedbackService";

export const feedbackService = new FeedbackService(new FeedbackRepository(), new OrderRepository(), mailService);
