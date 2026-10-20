"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CircleCheck, CircleX, Clock, ExternalLink, Inbox, LayoutDashboard, List, MonitorDown, Tag, Undo2, type LucideIcon } from "lucide-react";
import { isUnder, routes } from "@/helper/route";
import { portal, statusTabs } from "../content/adminContent";
import { orderListEvents, ordersLink, parseListQuery } from "../helper/adminHelper";
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
  const onList = pathname === routes.adminOrders;
  // The order list changes status in place, without the URL, and announces each change.
  const [shown, setShown] = useState<StatusFilter | null>(null);
  useEffect(() => {
    const onChange = (event: Event) => setShown((event as CustomEvent<StatusFilter>).detail);
    window.addEventListener(orderListEvents.changed, onChange);
    return () => window.removeEventListener(orderListEvents.changed, onChange);
  }, []);
  // Only the list itself has a current status; an order's own page marks none.
  const current = onList ? (shown ?? parseListQuery(Object.fromEntries(params)).status) : null;

  /** On the list, a status link switches it in place; elsewhere (or with a modifier key) it's a normal link. */
  const selectInPlace = (status: StatusFilter) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!onList || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.dispatchEvent(new CustomEvent(orderListEvents.select, { detail: status }));
  };

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
                onClick={selectInPlace(tab.id)}
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

      <p className="admin-nav__heading">{portal.storeHeading}</p>
      <ul className="admin-nav__list">
        <li>
          <Link href={routes.adminPlans} className="admin-nav__link" aria-current={isUnder(pathname, [routes.adminPlans]) ? "page" : undefined}>
            <Tag className="icon icon--sm" strokeWidth={1.75} />
            <span className="admin-nav__label">{portal.plans}</span>
          </Link>
        </li>
      </ul>

      <p className="admin-nav__heading">{portal.appHeading}</p>
      <ul className="admin-nav__list">
        <li>
          <Link href={routes.adminAppUpdate} className="admin-nav__link" aria-current={pathname === routes.adminAppUpdate ? "page" : undefined}>
            <MonitorDown className="icon icon--sm" strokeWidth={1.75} />
            <span className="admin-nav__label">{portal.appUpdate}</span>
          </Link>
        </li>
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
