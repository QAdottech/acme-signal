"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { searchRecords, type SearchCategory, type SearchResult } from "@/lib/searchData";

const categories: ("All" | SearchCategory)[] = [
  "All",
  "Organizations",
  "People",
  "Deals",
  "Tasks",
  "Notes",
  "Collections",
];

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [category, setCategory] = useState<"All" | SearchCategory>("All");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/" && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const visibleResults = (category === "All"
    ? results
    : results.filter((result) => result.category === category)
  ).slice(0, 8);

  const updateQuery = (value: string) => {
    setQuery(value);
    setResults(searchRecords(value));
    setIsOpen(value.trim().length > 0);
  };

  return (
    <div className="relative w-80" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          aria-label="Search CRM records"
          aria-expanded={isOpen}
          placeholder="Search records... (/)"
          className="pl-8 bg-gray-100 dark:bg-gray-800 border-transparent text-gray-900 dark:text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
          value={query}
          onFocus={() => {
            if (query.trim()) {
              setResults(searchRecords(query));
              setIsOpen(true);
            }
          }}
          onChange={(event) => updateQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && visibleResults.length > 0) {
              router.push(visibleResults[0].href);
              setIsOpen(false);
            }
          }}
        />
      </div>
      {isOpen && (
        <div className="absolute z-50 w-[30rem] max-w-[90vw] mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700">
          <div className="flex gap-1 overflow-x-auto px-2 py-2 border-b dark:border-gray-700" aria-label="Search categories">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded px-2 py-1 text-xs whitespace-nowrap ${category === item ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100" : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-700"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <ul className="py-1 overflow-auto max-h-80">
            {visibleResults.map((result) => (
              <li key={`${result.category}-${result.id}`}>
                <Link
                  href={result.href}
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-sm truncate">{result.label}</span>
                    <span className="text-xs text-muted-foreground">{result.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{result.detail}</p>
                </Link>
              </li>
            ))}
            {visibleResults.length === 0 && (
              <li className="px-4 py-4 text-sm text-muted-foreground">No {category === "All" ? "records" : category.toLowerCase()} found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
