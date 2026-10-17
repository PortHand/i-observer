import { redirect } from "next/navigation";
import PageHero from "@/app/(view)/(pview)/home/components/PageHero";
import { routes } from "@/helper/route";
import { accountService } from "@/server/features/account/module/accountModule";
import { requireUser } from "@/server/features/auth/guard/authGuard";
import { welcome } from "../content/welcomeContent";
import DownloadPanel from "./DownloadPanel";

/** Greeting and the download. Reads the session and the database, so render inside <Suspense>. */
export default async function Welcome() {
  const user = await requireUser();
  const access = await accountService.downloadAccess(user.id);
  if (!access) redirect(routes.signIn);

  return (
    <div className="welcome">
      <PageHero {...welcome} />
      <DownloadPanel access={access} />
    </div>
  );
}
