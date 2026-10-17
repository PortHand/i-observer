import { checkout } from "../content/getContent";

/** Heading of the checkout section, shared by the live checkout and its loading skeleton. */
export default function CheckoutHeader() {
  return (
    <header className="section__header">
      <div className="stack-sm">
        <span className="eyebrow">{checkout.eyebrow}</span>
        <h2 className="display section__title">{checkout.title}</h2>
      </div>
      <p className="lead">{checkout.lead}</p>
    </header>
  );
}
