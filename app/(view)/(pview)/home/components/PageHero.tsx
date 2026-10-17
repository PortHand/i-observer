interface PageHeroProps {
  eyebrow: string;
  title: string;
  lead: string;
  /** Extra class on the wrapper, e.g. "container" when it isn't inside one already. */
  className?: string;
}

/** Page header: red label, big title and one paragraph. Shared by every page that isn't the home page. */
export default function PageHero({ eyebrow, title, lead, className }: PageHeroProps) {
  return (
    <div className={className ? `page-hero animate-in ${className}` : "page-hero animate-in"}>
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="display page-hero__title">{title}</h1>
      <p className="lead page-hero__lead">{lead}</p>
    </div>
  );
}
