import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Globe } from "lucide-react";
import { LANGS, langMeta, type Lang } from "@/lib/langs";

/** One language row list (native name, code, check on the current one), shared by every picker. */
export function LangOptions({
  lang,
  onPick,
  labelledBy,
  label,
  rowClass = "h-11",
}: {
  lang: Lang;
  onPick: (lang: Lang) => void;
  labelledBy?: string;
  label?: string;
  rowClass?: string;
}) {
  function onKey(event: ReactKeyboardEvent<HTMLDivElement>) {
    const items = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="option"]')];
    const at = items.indexOf(document.activeElement as HTMLButtonElement);
    const go = (i: number) => items[(i + items.length) % items.length]?.focus();
    if (event.key === "ArrowDown") go(at + 1);
    else if (event.key === "ArrowUp") go(at - 1);
    else if (event.key === "Home") go(0);
    else if (event.key === "End") go(items.length - 1);
    else return;
    event.preventDefault();
  }
  return (
    <div role="listbox" aria-labelledby={labelledBy} aria-label={labelledBy ? undefined : label} onKeyDown={onKey} className="flex flex-col gap-0.5">
      {LANGS.map((item) => {
        const on = item.id === lang;
        return (
          <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={on}
            lang={item.html}
            data-lang={item.id}
            onClick={() => onPick(item.id)}
            className={`grid ${rowClass} w-full grid-cols-[1.25rem_minmax(0,1fr)_2.5rem] items-center gap-2 rounded-xl px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-pine/50 ${
              on ? "bg-pine/10 text-pine" : "text-ink hover:bg-paper"
            }`}
          >
            <span className="flex justify-center">{on ? <Check className="size-4" strokeWidth={2.5} aria-hidden="true" /> : null}</span>
            <span dir={item.dir} className={`truncate text-center font-medium ${item.dir === "rtl" ? "font-ar" : "font-sans"}`}>
              {item.name}
            </span>
            <span className={`text-end text-xs tracking-wide ${on ? "text-pine" : "text-muted"}`}>{item.code}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Header language button: globe + the current language's native name + chevron, with no frame
 * of its own; it takes the header's text colour (white on the red bar, ink on the white one).
 * Opens a bottom sheet on phones and a dropdown popover from md up. Escape closes and returns
 * focus to the button; the current language gets focus on open; arrow keys move through the list.
 */
export function HeaderLangPicker({ lang, setLang, title }: { lang: Lang; setLang: (lang: Lang) => void; title: string }) {
  const [open, setOpen] = useState<null | "sheet" | "popover">(null);
  const button = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const current = langMeta(lang);

  function close(refocus: boolean) {
    setOpen(null);
    if (refocus) button.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      } else if (event.key === "Tab" && open === "sheet" && panel.current) {
        // keep focus inside the modal sheet
        const items = [...panel.current.querySelectorAll<HTMLElement>("button")];
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    function onDown(event: PointerEvent) {
      const target = event.target as Node;
      if (!box.current?.contains(target) && !panel.current?.contains(target)) close(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    let prev: string | null = null;
    if (open === "sheet") {
      prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      if (prev !== null) document.body.style.overflow = prev;
    };
  }, [open]);

  function pick(next: Lang) {
    setLang(next);
    close(true);
  }

  return (
    <div ref={box} className="relative">
      <button
        ref={button}
        type="button"
        data-layout="lang-button"
        aria-haspopup={open === "sheet" ? "dialog" : "listbox"}
        aria-expanded={open !== null}
        aria-label={`${title}: ${current.short === current.name ? current.name : `${current.short} – ${current.name}`} (${current.code})`}
        onClick={() => {
          if (open) return close(false);
          setOpen(window.matchMedia("(min-width: 768px)").matches ? "popover" : "sheet");
        }}
        dir="ltr"
        className="inline-flex h-10 min-w-10 shrink-0 items-center justify-center gap-1.5 rounded-full px-2 text-ink hover:bg-paper"
      >
        <Globe className="size-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
        <span
          lang={current.html}
          dir={current.dir}
          className={`whitespace-nowrap text-sm leading-none font-medium ${current.dir === "rtl" ? "font-ar" : "font-sans"}`}
          aria-hidden="true"
        >
          {current.short}
        </span>
        <ChevronDown
          className={`size-3.5 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          strokeWidth={2.25}
          aria-hidden="true"
        />
      </button>
      {open === "popover" ? (
        <div
          ref={panel}
          data-layout="lang-popover"
          className="absolute end-0 top-full z-40 mt-2 w-72 rounded-2xl border border-line bg-surface p-1.5 shadow-xl"
        >
          <LangOptions lang={lang} onPick={pick} label={title} />
        </div>
      ) : null}
      {open === "sheet"
        ? createPortal(
            <div className="fixed inset-0 z-50" style={{ direction: "ltr" }}>
              <div className="absolute inset-0 bg-black/40" aria-hidden="true" onClick={() => close(true)} />
              <div
                ref={panel}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                data-layout="lang-sheet"
                className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-surface px-3 pt-2 pb-[calc(var(--safe-bottom)+1rem)] shadow-2xl"
              >
                <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-line" aria-hidden="true" />
                <h2 id={titleId} dir="auto" className="flex items-center gap-2 px-3 pt-1 pb-3 text-base font-bold">
                  <Globe className="size-5 text-pine" aria-hidden="true" />
                  <span>{title}</span>
                </h2>
                <LangOptions lang={lang} onPick={pick} labelledBy={titleId} rowClass="h-12" />
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
