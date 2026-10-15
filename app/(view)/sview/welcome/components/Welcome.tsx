import { redirect } from "next/navigation";
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
      <div className="page-hero animate-in">
        <span className="eyebrow">{welcome.eyebrow}</span>
        <h1 className="display page-hero__title">{welcome.title}</h1>
        <p className="lead page-hero__lead">{welcome.lead}</p>
      </div>
      <DownloadPanel access={access} />
    </div>
  );
}
