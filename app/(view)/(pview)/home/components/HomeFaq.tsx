import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Accordion from "@/components/common/Accordion";
import { faqs } from "../../contact/content/faqContent";
import { homeFaq } from "../content/homeContent";
import SectionHeader from "./SectionHeader";

/** A few common questions from the Contact page's FAQ, with a link to the rest. */
export default function HomeFaq() {
  const items = homeFaq.ids
    .map((id) => faqs.find((faq) => faq.id === id))
    .filter((faq) => faq !== undefined);

  return (
    <section className="band" id="faq">
      <div className="container section home-faq">
        <SectionHeader eyebrow={homeFaq.eyebrow} title={homeFaq.title} lead={homeFaq.lead} />
        <div className="home-faq__list" data-reveal>
          <Accordion
            items={items.map((faq) => ({
              id: `home-faq-${faq.id}`,
              title: faq.question,
              content: <p>{faq.answer}</p>,
            }))}
          />
          <Link href={homeFaq.more.href} className="button button--secondary home-faq__more">
            {homeFaq.more.label}
            <ArrowRight className="icon icon--sm" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </section>
  );
}
