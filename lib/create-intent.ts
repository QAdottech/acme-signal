"use client";

import { useEffect, useRef } from "react";

/**
 * "Create" intents let global UI (the ⌘K menu, sidebar buttons) open a page's
 * own create modal without that page exposing its state.
 *
 * - On a different page: navigate to `<path>?new=<kind>`; the page opens its
 *   modal on mount and strips the param.
 * - Already on that page: a window event opens the modal in place.
 */

export type CreateKind =
  | "deal"
  | "company"
  | "person"
  | "task"
  | "note"
  | "email"
  | "list";

/** Where each kind of record is created. */
export const CREATE_TARGETS: Record<CreateKind, string> = {
  deal: "/deals",
  company: "/organizations",
  person: "/people",
  task: "/tasks",
  note: "/notes",
  email: "/inbox",
  list: "/collections",
};

const EVENT = "acme:create";

export function dispatchCreateIntent(kind: CreateKind) {
  window.dispatchEvent(new CustomEvent<CreateKind>(EVENT, { detail: kind }));
}

/**
 * Open this page's create modal when a matching intent arrives, either as a
 * `?new=<kind>` param on load or as an in-page event.
 */
export function useCreateIntent(kind: CreateKind, open: () => void) {
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("new") === kind) {
      openRef.current();
      url.searchParams.delete("new");
      window.history.replaceState(
        window.history.state,
        "",
        url.pathname + url.search + url.hash
      );
    }

    const onIntent = (event: Event) => {
      if ((event as CustomEvent<CreateKind>).detail === kind) openRef.current();
    };
    window.addEventListener(EVENT, onIntent);
    return () => window.removeEventListener(EVENT, onIntent);
  }, [kind]);
}
