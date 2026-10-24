import { marquee } from "../content/homeContent";

/** The apps and captures the overlay stays out of, scrolling endlessly. The second copy is for the loop only. */
export default function Marquee() {
  const row = (hidden: boolean) => (
    <ul className="marquee__row" aria-hidden={hidden || undefined}>
      {marquee.items.map(({ label, icon: Icon }) => (
        <li key={label} className="marquee__item">
          <Icon className="icon" strokeWidth={1.75} />
          {label}
        </li>
      ))}
    </ul>
  );

  return (
    <section className="marquee" aria-label={marquee.label}>
      <p className="marquee__label mono">{marquee.label}</p>
      <div className="marquee__track">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
