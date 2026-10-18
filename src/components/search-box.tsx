/**
 * The global search field with an autocomplete panel.
 *
 * Mobile: on focus the same input becomes the top bar of a full-screen sheet
 * (so the keyboard never drops); desktop: a dropdown under the field. The
 * panel and the multilingual index are a separate chunk, fetched on the first
 * touch/focus of the field, so the main bundle only carries this shell.
 */
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MutableRefObject,
} from "react";
import type { Lang } from "@/lib/langs";
import { addRecent, clearRecent, readRecent } from "@/lib/search/recent";

const load = () => import("@/components/search-suggest");
const SearchSuggest = lazy(load);
let warmed: Promise<unknown> | null = null;
function warm() {
  warmed ??= load().catch(() => {
    warmed = null;
  });
}

const LISTBOX_ID = "rl-suggest";
const DEBOUNCE_MS = 60;

export type SearchBoxProps = {
  label: string;
  closeLabel: string;
  lang: Lang;
  ai: boolean;
  embedded?: boolean;
  /** Pages that filter in place (the Bazaar home) pass their query state. */
  search?: { q: string; setQ: (value: string) => void };
  /**
   * Set by the header: phones and tablets show a search icon button instead of the field and
   * call this to open the field (focus stays in the tap, so iOS raises the keyboard).
   */
  openRef?: MutableRefObject<(() => void) | null>;
};

export function SearchBox({
  label,
  closeLabel,
  lang,
  ai,
  search,
  embedded = false,
  openRef,
}: SearchBoxProps) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(search?.q ?? "");
  const [query, setQuery] = useState(text);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!openRef) return;
    openRef.current = () => inputRef.current?.focus();
    return () => {
      openRef.current = null;
    };
  }, [openRef]);

  // Follow the page's own query (URL changes, chips) while closed.
  useEffect(() => {
    if (!open && search) setText(search.q);
  }, [search, search?.q, open]);

  // Text typed before hydration stays in the field but not in state; adopt it so Enter
  // searches what the customer sees (slow networks hydrate late).
  useEffect(() => {
    const typed = inputRef.current?.value;
    if (typed) setText(typed);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setQuery(text);
      setActiveId(null);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [text]);

  const close = useCallback((blur: boolean) => {
    setOpen(false);
    setActiveId(null);
    if (blur) inputRef.current?.blur();
  }, []);

  useEffect(() => {
    close(false);
  }, [path, close]);

  // Mobile sheet: keep the page behind it still.
  useEffect(() => {
    if (!open || !window.matchMedia("(max-width: 767px)").matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Desktop dropdown: a press outside closes it.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) close(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, close]);

  function openPanel() {
    warm();
    setRecent(readRecent());
    setOpen(true);
  }

  function runSearch(value: string) {
    const clean = value.trim();
    if (clean) setRecent(addRecent(clean));
    setText(clean);
    close(true);
    if (search) search.setQ(clean);
    else void navigate({ to: "/stores", search: { q: clean || undefined } });
  }

  function options(): HTMLElement[] {
    return [...document.querySelectorAll<HTMLElement>(`#${LISTBOX_ID} [role="option"]`)];
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      if (open) close(window.matchMedia("(max-width: 767px)").matches);
      else setText("");
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) openPanel();
      const list = options();
      if (!list.length) return;
      const at = list.findIndex((el) => el.id === activeId);
      const next =
        event.key === "ArrowDown" ? (at + 1) % list.length : at <= 0 ? list.length - 1 : at - 1;
      setActiveId(list[next].id);
      list[next].scrollIntoView({ block: "nearest", inline: "nearest" });
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const chosen = activeId ? document.getElementById(activeId) : null;
      if (open && chosen) {
        chosen.click();
        return;
      }
      runSearch(text);
    }
  }

  const sheet = open
    ? "max-md:fixed max-md:inset-x-0 max-md:top-0 max-md:z-50 max-md:pt-[var(--safe-top)] max-md:shadow-sm"
    : "";

  return (
    <div
      ref={boxRef}
      data-open={open}
      className={embedded ? "rl-header-search relative" : "search-bar relative bg-paper"}
    >
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          runSearch(text);
        }}
        className={`${embedded ? "rl-search-form" : "border-b border-line bg-paper"} ${sheet}`}
      >
        <label
          className={
            embedded ? "rl-search-field" : "page flex h-[var(--search-h)] items-center gap-3"
          }
        >
          {open ? (
            <button
              type="button"
              aria-label={closeLabel}
              onClick={() => close(true)}
              className="-ms-2 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink hover:bg-surface"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          ) : (
            <Search className="size-5 shrink-0 text-muted" aria-hidden="true" />
          )}
          <input
            ref={inputRef}
            type="search"
            dir="auto"
            role="combobox"
            aria-expanded={open}
            aria-controls={LISTBOX_ID}
            aria-autocomplete="list"
            aria-activedescendant={open && activeId ? activeId : undefined}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={text}
            onPointerDown={warm}
            onFocus={openPanel}
            onChange={(event) => {
              setText(event.target.value);
              if (!open) openPanel();
            }}
            onKeyDown={onKeyDown}
            placeholder={label}
            aria-label={label}
            enterKeyHint="search"
            className="h-full min-w-0 flex-1 bg-transparent [&::-webkit-search-cancel-button]:appearance-none text-base text-ink outline-none placeholder:text-muted"
          />
        </label>
      </form>
      {open ? (
        <div
          data-layout="sheet"
          className="max-md:fixed max-md:inset-x-0 max-md:top-[calc(var(--search-h)+var(--safe-top))] max-md:bottom-0 max-md:z-50 max-md:overflow-y-auto max-md:overscroll-contain max-md:bg-paper md:absolute md:inset-x-0 md:top-full md:z-40"
        >
          <div className="md:page">
            <div className="md:max-h-[70vh] md:overflow-y-auto md:rounded-b-3xl md:border md:border-t-0 md:border-line md:bg-paper md:shadow-xl">
              <Suspense fallback={<div className="h-40" aria-hidden="true" />}>
                <SearchSuggest
                  query={query}
                  lang={lang}
                  activeId={activeId}
                  recent={recent}
                  ai={ai}
                  onChoose={() => {
                    if (text.trim()) setRecent(addRecent(text));
                    close(true);
                  }}
                  onSearch={runSearch}
                  onClearRecent={() => setRecent(clearRecent())}
                />
              </Suspense>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
