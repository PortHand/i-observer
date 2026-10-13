import { CircleUser } from "lucide-react";
import { appInfo, auth, navLinks } from "../content/homeContent";

export default function SiteHeader({ signedIn }: { signedIn: boolean }) {
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
          <a className="brand" href="#top">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="brand__logo" src="/logo.svg" alt="" />
            <span className="brand__name">
              {appInfo.name}
              <span className="brand__tagline">{appInfo.tagline}</span>
            </span>
          </a>
          <nav className="nav__links mono" aria-label="Sections">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <a href="#top" className="button button--secondary button--sm">
            <CircleUser className="icon icon--sm" strokeWidth={1.75} />
            <span>{signedIn ? auth.navSignedIn : auth.navSignedOut}</span>
          </a>
        </div>
      </header>
    </>
  );
}
