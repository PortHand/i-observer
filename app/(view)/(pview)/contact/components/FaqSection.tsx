"use client";

import Link from "next/link";
import { ArrowRight, Search, SearchX, X } from "lucide-react";
import Accordion from "@/components/common/Accordion";
import SectionHeader from "../../home/components/SectionHeader";
import { sectionIds } from "../content/contactContent";
import { allLabel, categories, faqSection, search } from "../content/faqContent";
import { useFaqHandler } from "../handler/useFaqHandler";
import FaqCategories, { type CategoryFilter } from "./FaqCategories";

export default function FaqSection() {
  const faq = useFaqHandler();
  const allCount = Object.values(faq.counts).reduce((sum, count) => sum + count, 0);
  const filters: CategoryFilter[] = [
    { id: "all", label: allLabel, count: allCount },
    ...categories.map((c) => ({ ...c, count: faq.counts[c.id] })),
  ];

  return (
    <section className="band" id={sectionIds.faq}>
      <div className="container section">
        <SectionHeader eyebrow={faqSection.eyebrow} title={faqSection.title} lead={faqSection.lead} />
        <div className="faq">
          <aside className="faq__sidebar">
            <label className="field">
              <span className="field__label">{search.label}</span>
              <span className="input-group">
                <Search className="icon" strokeWidth={1.75} />
                <input
                  className="input faq__search"
                  type="search"
                  value={faq.query}
                  placeholder={search.placeholder}
                  onChange={(event) => faq.setQuery(event.target.value)}
                />
                {faq.query && (
                  <button type="button" className="faq__clear" onClick={faq.clearQuery} aria-label={search.clear}>
                    <X className="icon icon--sm" strokeWidth={1.75} />
                  </button>
                )}
              </span>
            </label>

            <FaqCategories filters={filters} selected={faq.category} onSelect={faq.setCategory} />
          </aside>

          <div className="faq__results">
            <p className="faq__status mono" role="status">
              {search.results.replace("{count}", String(faq.resultCount)).replace("{total}", String(faq.total))}
            </p>

            {faq.groups.length === 0 ? (
              <div className="faq__empty">
                <SearchX className="icon icon--lg" strokeWidth={1.5} />
                <p>{search.empty.replace("{query}", faq.query)}</p>
                <div className="faq__empty-actions">
                  <button type="button" className="button button--secondary button--sm" onClick={faq.clearQuery}>
                    {search.clear}
                  </button>
                  <a className="button button--primary button--sm" href={search.emptyHref}>
                    {search.emptyCta}
                    <ArrowRight className="icon icon--sm" strokeWidth={1.75} />
                  </a>
                </div>
              </div>
            ) : (
              faq.groups.map((group) => (
                <section key={group.id} className="faq__group" aria-labelledby={`faq-${group.id}`}>
                  <h3 id={`faq-${group.id}`} className="faq__group-title">
                    {group.label}
                    <span className="faq__group-count mono" aria-hidden="true">
                      {group.items.length}
                    </span>
                  </h3>
                  <Accordion
                    headingLevel={4}
                    // Open every match while searching, so answers are visible without extra clicks.
                    key={faq.searching ? `search-${faq.resultsQuery}` : "browse"}
                    defaultOpen={faq.searching ? group.items.map((item) => `faq-${item.id}`) : []}
                    items={group.items.map((item) => ({
                      id: `faq-${item.id}`,
                      title: item.question,
                      content: (
                        <>
                          <p>{item.answer}</p>
                          {item.link && (
                            <Link className="text-link faq__link" href={item.link.href}>
                              {item.link.label}
                            </Link>
                          )}
                        </>
                      ),
                    }))}
                  />
                </section>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
