import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Download, Infinity as InfinityIcon, Mail, Phone, Receipt, ShieldAlert, ShieldCheck, ShieldOff } from "lucide-react";
import { formatPhone } from "@/app/(view)/(pview)/get-ioverlay/helper/getHelper";
import { routes } from "@/helper/route";
import { accountService } from "@/server/features/account/module/accountModule";
import { requireUser } from "@/server/features/auth/guard/authGuard";
import type { AccessSummary } from "../../welcome/services/welcomeService";
import { access as accessCopy, account, profile } from "../content/profileContent";
import { daysUntil, formatDate } from "../helper/profileHelper";
import FeedbackSection from "./FeedbackSection";

const accessIcons = { lifetime: InfinityIcon, active: ShieldCheck, expired: ShieldAlert, none: ShieldOff };

function AccessCard({ access }: { access: AccessSummary }) {
  const state = accessCopy.states[access.state];
  const Icon = accessIcons[access.state];
  const date = access.until ? formatDate(access.until) : "";
  const days = access.state === "active" && access.until ? daysUntil(access.until) : null;
  const canDownload = access.state === "active" || access.state === "lifetime";

  return (
    <div className={`card access-card access-card--${access.state} theme-ink`}>
      <span className="mono accent">{accessCopy.label}</span>
      <div className="access-card__state">
        <Icon className="icon access-card__icon" strokeWidth={1.75} />
        <h2>{state.title}</h2>
      </div>
      {days !== null && (
        <p className="access-card__days display">
          {days === 1 ? accessCopy.dayLeft : accessCopy.daysLeft.replace("{days}", String(days))}
        </p>
      )}
      <p className="text-muted">{state.text.replace("{date}", date)}</p>
      <div className="download__actions">
        {canDownload && (
          <Link href={routes.welcome} className="button button--primary">
            <Download className="icon icon--sm" strokeWidth={1.75} />
            {accessCopy.download}
          </Link>
        )}
        {access.state !== "lifetime" && (
          <Link href={routes.getIOverlay} className={canDownload ? "button button--secondary" : "button button--primary"}>
            {access.state === "none" ? accessCopy.buy : accessCopy.renew}
          </Link>
        )}
      </div>
      <Link href={routes.orders} className="hint access-card__orders">
        <Receipt className="icon icon--sm" strokeWidth={1.75} />
        {accessCopy.orders}
      </Link>
    </div>
  );
}

/** The signed-in customer's account, plan and feedback. Reads the session: render inside <Suspense>. */
export default async function Profile() {
  const user = await requireUser();
  const data = await accountService.profile(user.id);
  if (!data) redirect(routes.signIn);

  return (
    <div className="profile-page">

      <div className="page-hero animate-in">
        <span className="eyebrow">{profile.eyebrow}</span>
        <h1 className="display page-hero__title">{profile.title}</h1>
        <p className="lead page-hero__lead">{profile.lead}</p>
      </div>

      <div className="profile-grid animate-in animate-in--delayed">
        <div className="card account-card">
          <span className="mono accent">{account.label}</span>
          <div className="profile">
            <span className="avatar" aria-hidden="true">
              {data.account.email.charAt(0)}
            </span>
            <div>
              <p className="profile__label">{account.email}</p>
              <p className="profile__email">{data.account.email}</p>
            </div>
            <span className="welcome__role mono">{account.roles[data.account.role]}</span>
          </div>
          <dl className="account-card__rows">
            <div>
              <dt>
                <Mail className="icon icon--sm" strokeWidth={1.75} /> {account.email}
              </dt>
              <dd>{data.account.email}</dd>
            </div>
            <div>
              <dt>
                <Phone className="icon icon--sm" strokeWidth={1.75} /> {account.phone}
              </dt>
              <dd className="mono">{formatPhone(data.account.phone)}</dd>
            </div>
            <div>
              <dt>
                <CalendarDays className="icon icon--sm" strokeWidth={1.75} /> {account.memberSince}
              </dt>
              <dd>{formatDate(data.account.memberSince)}</dd>
            </div>
          </dl>
          <p className="hint">{account.passwordHint}</p>
        </div>
        <AccessCard access={data.access} />
      </div>

      <FeedbackSection references={data.orderReferences} initial={data.feedback} />
    </div>
  );
}
