import Link from "next/link";
import { CircleUser } from "lucide-react";
import { homeSection, routes } from "@/helper/route";
import { appInfo, auth, navLinks } from "../content/homeContent";

export default function SiteHeader({ signedIn, current }: { signedIn: boolean; current?: string }) {
  return (
    <>
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
          <Link href={homeSection("top")} className="button button--secondary button--sm">
            <CircleUser className="icon icon--sm" strokeWidth={1.75} />
            <span>{signedIn ? auth.navSignedIn : auth.navSignedOut}</span>
          </Link>
        </div>
      </header>
    </>
  );
}
