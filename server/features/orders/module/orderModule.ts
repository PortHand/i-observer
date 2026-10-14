// Wires the orders feature together. Route handlers in app/api/orders use orderController.

import "server-only";
import { OrderController } from "../controller/orderController";
import { OrderRepository } from "../repository/orderRepository";
import { OrderService } from "../service/orderService";

export const orderController = new OrderController(new OrderService(new OrderRepository()));
