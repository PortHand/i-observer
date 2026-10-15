"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { LoaderCircle, Search, X } from "lucide-react";
import { list } from "../content/adminContent";
import type { ListQuery } from "../helper/adminHelper";

/** How long typing pauses before the list updates, in milliseconds. */
const DEBOUNCE_MS = 300;

interface SearchFormProps {
  query: ListQuery;
  /** Results are loading: the search icon becomes a spinner. */
  pending: boolean;
  onSearch: (text: string) => void;
}

/** Searches as you type: the list updates once typing pauses (or on Enter), in place. */
export default function SearchForm({ query, pending, onSearch }: SearchFormProps) {
  const [value, setValue] = useState(query.search);
  /** The text last searched for, so a pause after Enter or Clear doesn't search for it again. */
  const searched = useRef(query.search);

  const search = (text: string) => {
    searched.current = text.trim();
    onSearch(searched.current);
  };
  const onPause = useEffectEvent(() => {
    if (value.trim() !== searched.current) search(value);
  });

  useEffect(() => {
    const timer = setTimeout(onPause, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <form
      className="admin-search"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        search(value);
      }}
    >
      <label className="input-group admin-search__field">
        <span className="visually-hidden">{list.searchLabel}</span>
        {pending ? <LoaderCircle className="icon admin-search__spinner" strokeWidth={1.75} /> : <Search className="icon" strokeWidth={1.75} />}
        <input
          className="input"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={list.searchPlaceholder}
          autoComplete="off"
          spellCheck={false}
        />
        {value && (
          <button
            type="button"
            className="admin-search__clear"
            aria-label={list.clear}
            onClick={() => {
              setValue("");
              search("");
            }}
          >
            <X className="icon icon--sm" strokeWidth={1.75} />
          </button>
        )}
      </label>
      <button type="submit" className="button button--secondary">
        {list.search}
      </button>
    </form>
  );
}
