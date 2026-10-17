import Link from "next/link";

export interface Topic {
  label: string;
  title: string;
  description: string;
  link?: { href: string; label: string };
}

/** Topic cards: red label, headline and short text, divided by hairlines. */
export default function TopicGrid({ topics }: { topics: Topic[] }) {
  return (
    <div className="topics">
      {topics.map(({ label, title, description, link }) => (
        <article key={title} className="topic">
          <span className="topic__label mono">{label}</span>
          <h3 className="display">{title}</h3>
          <p className="text-muted">{description}</p>
          {link && (
            <Link href={link.href} className="topic__link mono">
              {link.label} →
            </Link>
          )}
        </article>
      ))}
    </div>
  );
}
