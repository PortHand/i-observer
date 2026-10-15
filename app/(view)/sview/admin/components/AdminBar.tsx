import { LogOut } from "lucide-react";
import { signOut } from "@/server/features/auth/action/authActions";
import type { SessionUser } from "@/server/features/auth/service/authService";
import { portal } from "../content/adminContent";

/** Who is signed in, with a sign-out button, above every admin page. */
export default function AdminBar({ user }: { user: SessionUser }) {
  return (
    <div className="admin-bar">
      <p className="mono text-muted">
        {portal.signedInAs} <strong>{user.username}</strong>
      </p>
      <form action={signOut}>
        <button type="submit" className="button button--ghost button--sm">
          <LogOut className="icon icon--sm" strokeWidth={1.75} />
          {portal.signOut}
        </button>
      </form>
    </div>
  );
}
