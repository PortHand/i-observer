import { LogOut } from "lucide-react";
import { requireUser } from "@/server/features/auth/guard/authGuard";
import { signOut } from "@/server/features/auth/action/authActions";
import { welcome } from "../content/welcomeContent";

/** Greeting and account card. Reads the session, so render inside <Suspense>. */
export default async function Welcome() {
  const user = await requireUser();
  const copy = welcome;

  return (
    <div className="welcome">
      <div className="page-hero animate-in">
        <span className="eyebrow">{copy.eyebrow}</span>
        <h1 className="display page-hero__title">{copy.title}</h1>
        <p className="lead page-hero__lead">{copy.lead}</p>
      </div>
      <div className="card auth welcome__card theme-ink animate-in animate-in--delayed">
        <div className="profile">
          <span className="avatar" aria-hidden="true">
            {user.username.charAt(0)}
          </span>
          <div>
            <p className="profile__label">{welcome.profileLabel}</p>
            <p className="profile__email">{user.username}</p>
          </div>
          <span className="welcome__role mono">{welcome.roles[user.role]}</span>
        </div>
        <form action={signOut}>
          <button type="submit" className="button button--secondary button--block">
            <LogOut className="icon icon--sm" strokeWidth={1.75} />
            {welcome.signOut}
          </button>
        </form>
      </div>
    </div>
  );
}
