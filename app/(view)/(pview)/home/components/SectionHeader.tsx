export default function SectionHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead: string;
}) {
  return (
    <header className="section__header" data-reveal>
      <div className="stack-sm">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="display section__title">{title}</h2>
      </div>
      <p className="lead">{lead}</p>
    </header>
  );
}
