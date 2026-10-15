import Link from "next/link";
import { Suspense } from "react";
import { routes } from "@/helper/route";
import { appInfo } from "../../(pview)/home/content/homeContent";
import AdminSidebar from "./components/AdminSidebar";
import { portal } from "./content/adminContent";

/**
 * The admin portal's frame: a full-height ink sidebar (sections with counts, the signed-in admin,
 * sign out) beside the page. The sidebar reads the session and the database, so it streams in;
 * the brand above it is static.
 */
export default function AdminLayout({ children }: LayoutProps<"/sview/admin">) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar theme-ink">
        <Link className="brand admin-sidebar__brand" href={routes.admin}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="brand__logo" src="/logo.svg" alt="" />
          <span className="brand__name">
            {appInfo.name}
            <span className="brand__tagline">{portal.tagline}</span>
          </span>
        </Link>
        <Suspense fallback={null}>
          <AdminSidebar />
        </Suspense>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
