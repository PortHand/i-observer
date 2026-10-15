import { requireUser } from "@/server/features/auth/guard/authGuard";
import { orderReviewService } from "@/server/features/order/module/orderModule";
import { parseRange } from "../helper/adminHelper";
import DashboardView from "./DashboardView";

/**
 * The dashboard's first figures, for ?range= when a link sets it (30 days otherwise). From there
 * the period changes in place. Reads the session and the database: render inside <Suspense>.
 */
export default async function Dashboard({ searchParams }: { searchParams: PageProps<"/sview/admin">["searchParams"] }) {
  await requireUser("admin");
  const range = parseRange(await searchParams);
  const data = await orderReviewService.dashboard(range);
  return <DashboardView key={range} initial={data} />;
}
