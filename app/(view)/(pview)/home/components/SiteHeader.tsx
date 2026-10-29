import Link from "next/link";
import { Suspense } from "react";
import { CircleUser } from "lucide-react";
import { routes } from "@/helper/route";
import { getCurrentUser } from "@/server/features/auth/guard/authGuard";
import { appInfo, auth, navLinks } from "../content/homeContent";
import AccountMenu from "./AccountMenu";
import MobileNav from "./MobileNav";
import { OfferBarFallback } from "./OfferBar";
import OfferBarLoader from "./OfferBarLoader";

const SignInLink = ({ current }: { current?: string }) => (
  <Link
    href={routes.signIn}
    className="button button--secondary button--sm"
    aria-current={current === routes.signIn ? "page" : undefined}
    aria-label={auth.navSignedOut}
  >
    <CircleUser className="icon icon--sm" strokeWidth={1.75} />
    <span className="nav__sign-in-label">{auth.navSignedOut}</span>
  </Link>
);

/** A skeleton in the button's place while the session is read, so it never shows "Sign in" first. */
const AccountPlaceholder = () => (
  <span className="account-menu__trigger account-menu__trigger--placeholder" aria-hidden="true" />
);

/** The account menu for a signed-in visitor, else "Sign in". Reads the session and the account, so it streams in. */
async function AccountSlot({ current }: { current?: string }) {
  const user = await getCurrentUser();
  return user ? <AccountMenu email={user.email} role={user.role} current={current} /> : <SignInLink current={current} />;
}

/**
 * The site's top bar, under the offer bar when a countdown is running. The right-hand button
 * follows the visitor's session: "Sign in", or the account menu.
 */
export default function SiteHeader({ current }: { current?: string }) {
  return (
    <>
      {/* The admin's offer countdown, when one is running. The fallback keeps the last one in place
          while a navigation streams in, so the header doesn't jump. */}
      <Suspense fallback={<OfferBarFallback />}>
        <OfferBarLoader />
      </Suspense>
      <div className="utility-bar mono">
        <div className="container utility-bar__inner">
          <span>{appInfo.name}</span>
          <span>
            {appInfo.utility} · v{appInfo.version}
          </span>
        </div>
      </div>

      <header className="nav">
        <div className="container nav__inner">
          <Link className="brand" href={routes.home}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="brand__logo" src="/logo.svg" alt="" />
            <span className="brand__name">
              {appInfo.name}
              <span className="brand__tagline">{appInfo.tagline}</span>
            </span>
          </Link>
          <nav className="nav__links mono" aria-label="Sections">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={link.href === current ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Suspense fallback={<AccountPlaceholder />}>
            <AccountSlot current={current} />
          </Suspense>
          <MobileNav current={current} />
        </div>
      </header>
    </>
  );
}
