import { LogOut } from "lucide-react";
import { signOut } from "@/server/features/auth/action/authActions";
import { requireUser } from "@/server/features/auth/guard/authGuard";
import { orderReviewService } from "@/server/features/order/module/orderModule";
import { portal } from "../content/adminContent";
import SidebarNav from "./SidebarNav";

/** The sidebar's sections and footer. Reads the session and the database: render inside <Suspense>. */
export default async function AdminSidebar() {
  const user = await requireUser("admin");
  const counts = await orderReviewService.counts();

  return (
    <div className="admin-sidebar__body">
      <SidebarNav counts={counts} />
      <div className="admin-sidebar__footer">
        <div className="profile">
          <span className="avatar" aria-hidden="true">
            {user.username.charAt(0)}
          </span>
          <div className="admin-sidebar__user">
            <p className="profile__label">{portal.signedInAs}</p>
            <p className="profile__email">{user.username}</p>
          </div>
        </div>
        <form action={signOut}>
          <button type="submit" className="button button--secondary button--sm button--block">
            <LogOut className="icon icon--sm" strokeWidth={1.75} />
            {portal.signOut}
          </button>
        </form>
      </div>
    </div>
  );
}
