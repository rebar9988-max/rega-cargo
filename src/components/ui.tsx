import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { Moon, Sun, X, type LucideIcon } from "lucide-react";
import { Eur, Iqd } from "./field";
import { useI18n } from "@/lib/i18n";
import { redesignCopy } from "@/lib/redesign-copy";
import { useTheme } from "@/lib/theme";
export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  return (
    <button type="button" className={`rl-button ${className}`} data-variant={variant} {...props} />
  );
}
export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`rl-control ${className}`} {...props} />;
}
export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`rl-control ${className}`} {...props} />;
}
export function Badge({
  tone = "neutral",
  className = "",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "accent" | "success" }) {
  return <span className={`rl-badge ${className}`} data-tone={tone} {...props} />;
}
export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rl-card ${className}`} {...props} />;
}
export function Chip({
  selected = false,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button type="button" className={`rl-chip ${className}`} aria-pressed={selected} {...props} />
  );
}
export function Icon({
  as: Component,
  directional = false,
  className = "",
}: {
  as: LucideIcon;
  directional?: boolean;
  className?: string;
}) {
  return (
    <Component
      aria-hidden="true"
      className={`rl-icon ${directional ? "rl-directional" : ""} ${className}`}
    />
  );
}
export function Price({ eur }: { eur: number }) {
  return (
    <span className="rl-price">
      <Eur value={eur} />
      <Iqd eur={eur} />
    </span>
  );
}
export function Skeleton({ className = "" }: { className?: string }) {
  const { lang } = useI18n();
  return (
    <div role="status" className={`rl-skeleton ${className}`}>
      <span className="sr-only">{redesignCopy(lang).loading}</span>
    </div>
  );
}
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { lang } = useI18n();
  const c = redesignCopy(lang);
  return (
    <Button
      variant="ghost"
      aria-label={theme === "light" ? c.dark : c.light}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Icon as={theme === "light" ? Moon : Sun} />
    </Button>
  );
}
export function Modal({
  open,
  onClose,
  title,
  children,
  bottomSheet = false,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  bottomSheet?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const { lang } = useI18n();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
    if (!open) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = before;
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`rl-modal ${bottomSheet ? "rl-sheet" : ""} ${className}`}
      aria-labelledby={id}
      onCancel={onClose}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="rl-modal-head">
        <h2 id={id}>{title}</h2>
        <Button variant="ghost" aria-label={redesignCopy(lang).close} onClick={onClose}>
          <Icon as={X} />
        </Button>
      </div>
      {children}
    </dialog>
  );
}
export function BottomSheet(props: Omit<Parameters<typeof Modal>[0], "bottomSheet">) {
  return <Modal {...props} bottomSheet />;
}
