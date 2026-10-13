"use client";

import { useDeferredValue, useState } from "react";
import { faqs, type CategoryId } from "../content/faqContent";
import { countByCategory, filterFaqs, groupFaqs } from "../helper/faqHelper";

export const useFaqHandler = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | "all">("all");
  // Filtering is cheap, but deferring keeps typing smooth if the list grows.
  const deferredQuery = useDeferredValue(query);

  const results = filterFaqs(deferredQuery, category);

  return {
    query,
    category,
    groups: groupFaqs(results),
    resultCount: results.length,
    total: faqs.length,
    counts: countByCategory(deferredQuery),
    searching: deferredQuery.trim() !== "",
    /** The query the results reflect; lags `query` slightly while typing. */
    resultsQuery: deferredQuery,
    setQuery,
    setCategory,
    clearQuery: () => setQuery(""),
  };
};
