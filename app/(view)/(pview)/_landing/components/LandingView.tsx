// The callout and "Good to know" box share the "What is iOverlay?" page's styles.
import "../../what-is-ioverlay/what-is-ioverlay.css";
import "../landing.css";
import { CircleAlert } from "lucide-react";
import Accordion from "@/components/common/Accordion";
import JsonLd from "@/components/common/JsonLd";
import { homeSections } from "@/helper/route";
import { breadcrumbJsonLd, faqJsonLd, howToJsonLd } from "@/helper/seo";
import Closing from "../../home/components/Closing";
import PageHero from "../../home/components/PageHero";
import SectionHeader from "../../home/components/SectionHeader";
import SiteFooter from "../../home/components/SiteFooter";
import SiteHeader from "../../home/components/SiteHeader";
import StepList from "../../home/components/StepList";
import TopicGrid from "../../home/components/TopicGrid";
import { closing, landingList, limits, related, type LandingPage } from "../content/landingContent";

/**
 * One search landing page: hero, one-line summary, features, steps, FAQ and links to the others.
 * The FAQ answers are in the HTML even while closed, so search engines read them.
 */
export default function LandingView({ page }: { page: LandingPage }) {
  const others = landingList
    .filter((other) => other.path !== page.path)
    .map((other) => ({
      label: other.name,
      title: other.hero.title,
      description: other.callout.text,
      link: { href: other.path, label: related.more },
    }));

  return (
    <>
      <SiteHeader current={page.path} />
      <main>
        <section className="band" id={homeSections.top}>
          <PageHero {...page.hero} className="container" />
        </section>
        <section className="band">
          <div className="container section section--compact">
            <p className="callout landing__callout">
              <strong>{page.callout.label}</strong> {page.callout.text}
            </p>
          </div>
        </section>
        <section className="band band--light">
          <div className="container section">
            <SectionHeader eyebrow={page.features.eyebrow} title={page.features.title} lead={page.features.lead} />
            <TopicGrid topics={page.features.topics} />
          </div>
        </section>
        <section className="band">
          <div className="container section">
            <SectionHeader eyebrow={page.steps.eyebrow} title={page.steps.title} lead={page.steps.lead} />
            <StepList items={page.steps.items} four />
            <div className="limits landing__limits">
              <span className="limits__title mono">
                <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
                {limits.title}
              </span>
              <ul>
                {limits.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        <section className="band band--light">
          <div className="container section">
            <SectionHeader eyebrow={page.faq.eyebrow} title={page.faq.title} lead={page.faq.lead} />
            <Accordion
              items={page.faq.items.map((item, index) => ({
                id: `faq-${index}`,
                title: item.question,
                content: <p>{item.answer}</p>,
              }))}
            />
          </div>
        </section>
        <section className="band">
          <div className="container section">
            <SectionHeader {...related} />
            <TopicGrid topics={others} />
          </div>
        </section>
        <Closing {...closing} />
      </main>
      <SiteFooter />
      <JsonLd
        data={[
          faqJsonLd(page.faq.items),
          howToJsonLd(`How to use iOverlay: ${page.name}`, page.steps.items),
          breadcrumbJsonLd(page.name, page.path),
        ]}
      />
    </>
  );
}
