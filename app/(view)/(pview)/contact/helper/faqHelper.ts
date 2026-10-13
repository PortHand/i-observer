import { categories, faqs, type CategoryId, type Faq } from "../content/faqContent";

/** Lower-case, accent-free text for matching "UTR", "utr" and "Utr" alike. */
const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Every word of the query must appear in the question or answer, in any order. */
export const matchesQuery = (faq: Faq, query: string) => {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalize(`${faq.question} ${faq.answer}`);
  return words.every((word) => haystack.includes(word));
};

export const filterFaqs = (query: string, category: CategoryId | "all") =>
  faqs.filter((faq) => (category === "all" || faq.category === category) && matchesQuery(faq, query));

/** Filtered questions grouped by category, in category order, skipping empty groups. */
export const groupFaqs = (items: Faq[]) =>
  categories
    .map((category) => ({ ...category, items: items.filter((faq) => faq.category === category.id) }))
    .filter((group) => group.items.length > 0);

/** Question counts per category for the current search, shown on the category filters. */
export const countByCategory = (query: string) =>
  Object.fromEntries(
    categories.map(({ id }) => [id, faqs.filter((faq) => faq.category === id && matchesQuery(faq, query)).length]),
  ) as Record<CategoryId, number>;
