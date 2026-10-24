import Link from "next/link";
import { Mail } from "lucide-react";
import { routes } from "@/helper/route";
import { appInfo, footer, footerLinks } from "../content/homeContent";

export default function SiteFooter() {
  return (
    <footer className="page-footer">
      <div className="container page-footer__top">
        <div className="page-footer__brand">
          <Link className="brand" href={routes.home}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="brand__logo" src="/logo.svg" alt="" />
            <span className="brand__name">
              {appInfo.name}
              <span className="brand__tagline">{appInfo.tagline}</span>
            </span>
          </Link>
          <p className="text-muted">{footer.blurb}</p>
          <a className="hint page-footer__mail" href={`mailto:${appInfo.supportEmail}`}>
            <Mail className="icon icon--sm" strokeWidth={1.75} />
            {appInfo.supportEmail}
          </a>
        </div>
        <nav className="page-footer__links" aria-label={footer.linksLabel}>
          {footerLinks.map(({ href, label }) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="page-footer__wordmark" aria-hidden="true">
        {appInfo.name}
      </p>
      <div className="container page-footer__inner mono">
        <span>{appInfo.name}</span>
        <span>v{appInfo.version}</span>
      </div>
    </footer>
  );
}
