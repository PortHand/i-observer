import type { Metadata } from "next";
import "./contact.css";
import { homeSections, routes } from "@/helper/route";
import SiteFooter from "../home/components/SiteFooter";
import SiteHeader from "../home/components/SiteHeader";
import ContactSection from "./components/ContactSection";
import FaqSection from "./components/FaqSection";
import { intro } from "./content/contactContent";

export const metadata: Metadata = {
  title: "Contact",
  description: "Email iOverlay support, send a message, or find answers about payments, logins and the app.",
};

export default function ContactView() {
  return (
    <>
      <SiteHeader signedIn={false} current={routes.contact} />
      <main>
        <section className="band" id={homeSections.top}>
          <div className="container page-hero animate-in">
            <span className="eyebrow">{intro.eyebrow}</span>
            <h1 className="display page-hero__title">{intro.title}</h1>
            <p className="lead page-hero__lead">{intro.lead}</p>
          </div>
        </section>
        <ContactSection />
        <FaqSection />
      </main>
      <SiteFooter />
    </>
  );
}
