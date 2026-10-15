"use client";

// The header's account button for signed-in visitors (a round avatar): opens a menu with who is signed in, links to
// their pages and sign out. Follows the WAI-ARIA menu button pattern: Enter/Space/ArrowDown open it
// on the first item, arrows move, Escape closes and returns focus, Tab or a click outside closes.

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Download, LayoutDashboard, LogOut, Receipt, UserRound, type LucideIcon } from "lucide-react";
import { routes } from "@/helper/route";
import { signOut } from "@/server/features/auth/action/authActions";
import { auth } from "../content/homeContent";

interface AccountMenuProps {
  email: string;
  role: "customer" | "admin";
  current?: string;
}

const { menu } = auth;

export default function AccountMenu({ email, role, current }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const links: { href: string; label: string; icon: LucideIcon }[] =
    role === "admin"
      ? [
          { href: routes.admin, label: menu.admin, icon: LayoutDashboard },
          { href: routes.welcome, label: menu.download, icon: Download },
        ]
      : [
          { href: routes.welcome, label: menu.download, icon: Download },
          { href: routes.profile, label: menu.profile, icon: UserRound },
          { href: routes.orders, label: menu.orders, icon: Receipt },
        ];

  const items = () => Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  const focusItem = (index: number) => {
    const list = items();
    list[(index + list.length) % list.length]?.focus();
  };

  // Focus the first item when the menu opens, so keyboard users land inside it.
  useEffect(() => {
    if (open) rootRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [open]);

  // Close on a click outside.
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const closeAndReturn = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
    }
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLElement);
    if (event.key === "ArrowDown") focusItem(index + 1);
    else if (event.key === "ArrowUp") focusItem(index - 1);
    else if (event.key === "Home") focusItem(0);
    else if (event.key === "End") focusItem(-1);
    else if (event.key === "Escape") closeAndReturn();
    else if (event.key === "Tab") return setOpen(false);
    else return;
    event.preventDefault();
  };

  const onCurrentPage = links.some((link) => link.href === current);

  return (
    <div ref={rootRef} className={open ? "account-menu account-menu--open" : "account-menu"}>
      <button
        ref={triggerRef}
        type="button"
        className={onCurrentPage ? "account-menu__trigger account-menu__trigger--current" : "account-menu__trigger"}
        title={email}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`${auth.navSignedIn}: ${email}`}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onTriggerKeyDown}
      >
        <span aria-hidden="true">{email.charAt(0)}</span>
      </button>

      {open && (
        <div id={menuId} className="account-menu__panel" role="menu" aria-label={auth.navSignedIn} onKeyDown={onMenuKeyDown}>
          <div className="account-menu__who">
            <span className="avatar" aria-hidden="true">
              {email.charAt(0)}
            </span>
            <div className="account-menu__who-text">
              <span className="profile__label">{menu.signedInAs}</span>
              <span className="account-menu__email" title={email}>
                {email}
              </span>
            </div>
            <span className="account-menu__role mono">{menu.roles[role]}</span>
          </div>

          <div className="account-menu__group" role="none">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                tabIndex={-1}
                className="account-menu__item"
                aria-current={href === current ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                <Icon className="icon icon--sm" strokeWidth={1.75} />
                {label}
              </Link>
            ))}
          </div>

          <form action={signOut} className="account-menu__group" role="none">
            <button type="submit" role="menuitem" tabIndex={-1} className="account-menu__item account-menu__item--danger">
              <LogOut className="icon icon--sm" strokeWidth={1.75} />
              {menu.signOut}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
