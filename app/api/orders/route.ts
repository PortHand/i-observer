import { orderController } from "@/server/features/orders/module/orderModule";

export const POST = (request: Request) => orderController.create(request);
