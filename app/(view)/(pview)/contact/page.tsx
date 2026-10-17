import type { Metadata } from "next";
import "./contact.css";
import JsonLd from "@/components/common/JsonLd";
import { homeSections, routes } from "@/helper/route";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/helper/seo";
import SiteFooter from "../home/components/SiteFooter";
import PageHero from "../home/components/PageHero";
import SiteHeader from "../home/components/SiteHeader";
import ContactSection from "./components/ContactSection";
import FaqSection from "./components/FaqSection";
import { intro } from "./content/contactContent";
import { faqs } from "./content/faqContent";

export const metadata: Metadata = pageMetadata({
  title: "Contact Support and FAQ",
  description:
    "Email iOverlay support, send a message, or find answers about hiding from screen shares, paying by UPI, getting your login and using the app.",
  path: routes.contact,
  ownShareImage: true,
});

export default function ContactView() {
  return (
    <>
      <SiteHeader current={routes.contact} />
      <main>
        <section className="band" id={homeSections.top}>
          <PageHero {...intro} className="container" />
        </section>
        <ContactSection />
        <FaqSection />
      </main>
      <SiteFooter />
      <JsonLd data={[faqJsonLd(faqs), breadcrumbJsonLd("Contact", routes.contact)]} />
    </>
  );
}
