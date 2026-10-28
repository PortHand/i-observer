import { pricing } from "../content/homeContent";
import type { CountdownLeft } from "../handler/useOfferCountdown";

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * The countdown's digits: days (only while at least one is left), hours, minutes and seconds.
 * `left` is null until the browser's clock is read, and shows dashes. "large" puts each in a tile
 * with its unit under it; "compact" runs them inline, e.g. "02d 05h 13m 09s".
 */
export default function CountdownClock({ left, deadline, size }: { left: CountdownLeft | null; deadline: number; size: "large" | "compact" }) {
  const { units, short } = pricing.countdown;
  const parts = [
    { key: "days", value: left?.days },
    { key: "hours", value: left?.hours },
    { key: "minutes", value: left?.minutes },
    { key: "seconds", value: left?.seconds },
  ] as const;
  const shown = left && left.days === 0 ? parts.slice(1) : parts;

  return (
    <time className={`countdown-clock countdown-clock--${size}`} dateTime={new Date(deadline).toISOString()} aria-hidden="true">
      {shown.map((part, index) => (
        <span key={part.key} className="countdown-clock__part">
          {index > 0 && size === "large" && <span className="countdown-clock__colon">:</span>}
          <span className="countdown-clock__unit">
            <span className="countdown-clock__value">{part.value === undefined ? "--" : pad(part.value)}</span>
            <span className="countdown-clock__label">{size === "large" ? units[part.key] : short[part.key]}</span>
          </span>
        </span>
      ))}
    </time>
  );
}
