import Link from "next/link";
import { Download, Infinity as InfinityIcon, Receipt, ShieldAlert, ShieldCheck, ShieldOff } from "lucide-react";
import { routes } from "@/helper/route";
import type { AccessSummary } from "../../welcome/services/welcomeService";
import { access as accessCopy } from "../content/profileContent";
import { daysUntil, formatDate, formatDateTime, hoursUntil } from "../helper/profileHelper";

const accessIcons = { lifetime: InfinityIcon, active: ShieldCheck, expired: ShieldAlert, none: ShieldOff };

/** "12 days left", or in hours under a day: "3 hours left". */
const timeLeft = (until: string) => {
  const hours = hoursUntil(until);
  if (hours <= 1) return accessCopy.hourLeft;
  if (hours < 24) return accessCopy.hoursLeft.replace("{hours}", String(hours));
  const days = daysUntil(until);
  return days === 1 ? accessCopy.dayLeft : accessCopy.daysLeft.replace("{days}", String(days));
};

/** The customer's plan: lifetime, days left, ended, or none, with download and renew links. */
export default function AccessCard({ access }: { access: AccessSummary }) {
  const state = accessCopy.states[access.state];
  const Icon = accessIcons[access.state];
  const hours = access.until ? hoursUntil(access.until) : 0;
  // Under two days left (e.g. an hour pass), the time it ends matters too.
  const date = access.until ? (access.state === "active" && hours < 48 ? formatDateTime(access.until) : formatDate(access.until)) : "";
  const left = access.state === "active" && access.until ? timeLeft(access.until) : null;
  const canDownload = access.state === "active" || access.state === "lifetime";

  return (
    <div className={`card access-card access-card--${access.state} theme-ink`}>
      <span className="mono accent">{accessCopy.label}</span>
      <div className="access-card__state">
        <Icon className="icon access-card__icon" strokeWidth={1.75} />
        <h2>{state.title}</h2>
      </div>
      {left !== null && <p className="access-card__days display">{left}</p>}
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
