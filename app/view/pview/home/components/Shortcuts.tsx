import { shortcutRows, shortcutsSection } from "../content/homeContent";
import { getShortcuts, type Platform } from "../helper/homeHelper";
import Keys from "./Keys";
import SectionHeader from "./SectionHeader";

export default function Shortcuts({ platform }: { platform: Platform }) {
  const shortcuts = getShortcuts(platform);

  return (
    <section className="band" id="shortcuts-section">
      <div className="container section">
        <SectionHeader {...shortcutsSection} />
        <ul className="list">
          {shortcutRows.map(({ action, label, icon: Icon }) => (
            <li key={action}>
              <Icon className="icon list__icon" strokeWidth={1.75} />
              <span className="list__label">{label}</span>
              <Keys accelerator={shortcuts[action]} platform={platform} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
