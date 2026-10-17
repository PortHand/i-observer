import { CalendarDays, Mail, Phone } from "lucide-react";
import { formatPhone } from "@/app/(view)/(pview)/get-ioverlay/helper/getHelper";
import { account } from "../content/profileContent";
import { formatDate } from "../helper/profileHelper";
import type { CustomerProfile } from "../services/profileService";

/** Who is signed in: email, phone and since when. */
export default function AccountCard({ data }: { data: CustomerProfile["account"] }) {
  return (
    <div className="card account-card">
      <span className="mono accent">{account.label}</span>
      <div className="profile">
        <span className="avatar" aria-hidden="true">
          {data.email.charAt(0)}
        </span>
        <div>
          <p className="profile__label">{account.email}</p>
          <p className="profile__email">{data.email}</p>
        </div>
        <span className="welcome__role mono">{account.roles[data.role]}</span>
      </div>
      <dl className="account-card__rows">
        <div>
          <dt>
            <Mail className="icon icon--sm" strokeWidth={1.75} /> {account.email}
          </dt>
          <dd>{data.email}</dd>
        </div>
        <div>
          <dt>
            <Phone className="icon icon--sm" strokeWidth={1.75} /> {account.phone}
          </dt>
          <dd className="mono">{formatPhone(data.phone)}</dd>
        </div>
        <div>
          <dt>
            <CalendarDays className="icon icon--sm" strokeWidth={1.75} /> {account.memberSince}
          </dt>
          <dd>{formatDate(data.memberSince)}</dd>
        </div>
      </dl>
      <p className="hint">{account.passwordHint}</p>
    </div>
  );
}
