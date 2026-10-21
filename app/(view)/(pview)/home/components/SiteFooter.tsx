import Link from "next/link";
import { appInfo, footer, footerLinks } from "../content/homeContent";

export default function SiteFooter() {
  return (
    <footer className="page-footer theme-ink">
      <nav className="container page-footer__links mono" aria-label={footer.linksLabel}>
        {footerLinks.map(({ href, label }) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
      </nav>
      <div className="container page-footer__inner mono">
        <span>{appInfo.name}</span>
        <span>v{appInfo.version}</span>
      </div>
    </footer>
  );
}
