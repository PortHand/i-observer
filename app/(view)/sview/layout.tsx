// Secure pages: every folder under sview needs sign-in and is served under /sview. proxy.ts
// redirects signed-out visitors before these render, so a new page here is protected without
// listing it anywhere. Each page still calls requireUser (server/features/auth/guard/authGuard.ts),
// which checks the account in the database and, for admin-only pages, the role.
// Same shared styles as the public pages; see app/(view)/(pview)/layout.tsx for why they load here.
import "../(pview)/home/home.css";
import "./welcome/welcome.css";
import "./profile/profile.css";
import "./admin/admin.css";

export default function SignedInLayout({ children }: LayoutProps<"/">) {
  return children;
}
