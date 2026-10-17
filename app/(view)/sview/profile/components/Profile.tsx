import { redirect } from "next/navigation";
import PageHero from "@/app/(view)/(pview)/home/components/PageHero";
import { routes } from "@/helper/route";
import { accountService } from "@/server/features/account/module/accountModule";
import { requireUser } from "@/server/features/auth/guard/authGuard";
import { profile } from "../content/profileContent";
import AccessCard from "./AccessCard";
import AccountCard from "./AccountCard";
import FeedbackSection from "./FeedbackSection";

/** The signed-in customer's account, plan and feedback. Reads the session: render inside <Suspense>. */
export default async function Profile() {
  const user = await requireUser();
  const data = await accountService.profile(user.id);
  if (!data) redirect(routes.signIn);

  return (
    <div className="profile-page">
      <PageHero {...profile} />

      <div className="profile-grid animate-in animate-in--delayed">
        <AccountCard data={data.account} />
        <AccessCard access={data.access} />
      </div>

      <FeedbackSection references={data.orderReferences} initial={data.feedback} />
    </div>
  );
}
