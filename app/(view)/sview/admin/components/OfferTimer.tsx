import { requireUser } from "@/server/features/auth/guard/authGuard";
import { offerTimerService } from "@/server/features/offerTimer/module/offerTimerModule";
import OfferTimerForm from "./OfferTimerForm";

/** The saved offer timer, read fresh. Reads the session and the database: render inside <Suspense>. */
export default async function OfferTimer() {
  await requireUser("admin");
  // Straight from the database, not the pages' cache, so the page always shows what's saved.
  const timer = await offerTimerService.timer();
  return <OfferTimerForm initial={timer} />;
}
