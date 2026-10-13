import Link from "next/link";
import { loginHelp } from "../content/signInContent";

/** Where the login comes from and what to do when it's missing. */
export default function LoginHelp() {
  return (
    <div className="sign-in__help">
      <span className="section-label">{loginHelp.title}</span>
      <ul>
        {loginHelp.items.map((item) => (
          <li key={item.title}>
            <span className="sign-in__help-title">{item.title}</span>
            <span className="text-muted">{item.text}</span>
            {item.link && (
              <Link className="sign-in__help-link text-link" href={item.link.href}>
                {item.link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
