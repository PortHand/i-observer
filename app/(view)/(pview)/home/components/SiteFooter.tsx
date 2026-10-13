import { appInfo } from "../content/homeContent";

export default function SiteFooter() {
  return (
    <footer className="page-footer theme-ink">
      <div className="container page-footer__inner mono">
        <span>{appInfo.name}</span>
        <span>v{appInfo.version}</span>
      </div>
    </footer>
  );
}
