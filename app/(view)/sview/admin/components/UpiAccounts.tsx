import { requireUser } from "@/server/features/auth/guard/authGuard";
import { pricingService } from "@/server/features/pricing/module/pricingModule";
import UpiAccountsManager from "./UpiAccountsManager";

/** Every UPI account, read fresh. Reads the session and the database: render inside <Suspense>. */
export default async function UpiAccounts() {
  await requireUser("admin");
  const accounts = await pricingService.upiAccounts();
  return <UpiAccountsManager accounts={accounts} />;
}
