import { orderController } from "@/server/features/orders/module/orderModule";

export const POST = async (request: Request, context: RouteContext<"/api/orders/[reference]/transaction">) =>
  orderController.submitTransaction(request, (await context.params).reference);
