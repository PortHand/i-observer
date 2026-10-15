"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CircleCheck, CircleX, Clock, ExternalLink, Inbox, LayoutDashboard, List, Undo2, type LucideIcon } from "lucide-react";
import { routes } from "@/helper/route";
import { portal, statusTabs } from "../content/adminContent";
import { ordersLink, parseListQuery } from "../helper/adminHelper";
import type { AdminOrderPage, StatusFilter } from "../services/adminService";

const icons: Record<StatusFilter, LucideIcon> = {
  submitted: Inbox,
  pending: Clock,
  verified: CircleCheck,
  rejected: CircleX,
  refunded: Undo2,
  all: List,
};

/** One link per order status, with its count. The current list's status is marked. */
export default function SidebarNav({ counts }: { counts: AdminOrderPage["counts"] }) {
  const pathname = usePathname();
  const params = useSearchParams();
  // Only the list itself has a current status; an order's own page marks none.
  const current = pathname === routes.adminOrders ? parseListQuery(Object.fromEntries(params)).status : null;

  return (
    <nav className="admin-nav" aria-label={portal.navLabel}>
      <p className="admin-nav__heading">{portal.overviewHeading}</p>
      <ul className="admin-nav__list">
        <li>
          <Link href={routes.admin} className="admin-nav__link" aria-current={pathname === routes.admin ? "page" : undefined}>
            <LayoutDashboard className="icon icon--sm" strokeWidth={1.75} />
            <span className="admin-nav__label">{portal.dashboard}</span>
          </Link>
        </li>
      </ul>

      <p className="admin-nav__heading">{portal.ordersHeading}</p>
      <ul className="admin-nav__list">
        {statusTabs.map((tab) => {
          const Icon = icons[tab.id];
          // Orders waiting on us stand out.
          const attention = tab.id === "submitted" && counts.submitted > 0;
          return (
            <li key={tab.id}>
              <Link
                href={ordersLink({ status: tab.id })}
                className="admin-nav__link"
                aria-current={tab.id === current ? "page" : undefined}
              >
                <Icon className="icon icon--sm" strokeWidth={1.75} />
                <span className="admin-nav__label">{tab.label}</span>
                <span className={`admin-nav__count${attention ? " admin-nav__count--attention" : ""}`}>{counts[tab.id]}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="admin-nav__heading">{portal.siteHeading}</p>
      <ul className="admin-nav__list">
        <li>
          <Link href={routes.home} className="admin-nav__link">
            <ExternalLink className="icon icon--sm" strokeWidth={1.75} />
            <span className="admin-nav__label">{portal.viewSite}</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
