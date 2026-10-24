import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export interface Topic {
  label: string;
  title: string;
  description: string;
  link?: { href: string; label: string };
}

/** Topic cards: accent label, headline and short text, on glass cards that rise in one after another. */
export default function TopicGrid({ topics }: { topics: Topic[] }) {
  return (
    <div className="topics">
      {topics.map(({ label, title, description, link }, index) => (
        <article
          key={title}
          className="topic"
          data-reveal
          data-spotlight
          style={{ "--reveal-order": index % 3 } as CSSProperties}
        >
          <span className="topic__label mono">{label}</span>
          <h3 className="display">{title}</h3>
          <p className="text-muted">{description}</p>
          {link && (
            <Link href={link.href} className="topic__link mono">
              {link.label}
              <ArrowUpRight className="icon icon--sm" strokeWidth={1.75} />
            </Link>
          )}
        </article>
      ))}
    </div>
  );
}
