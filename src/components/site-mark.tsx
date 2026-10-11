/** Official R&L logo (owner-supplied artwork, Oct 2026). Never edit the artwork; changed art ships under a new file name. */
export function Mark({ className = "size-14" }: { className?: string }) {
  return (
    <img
      src="/rl-mark-168.webp"
      alt="R&L"
      width={56}
      height={56}
      decoding="async"
      className={`${className} shrink-0 rounded-xl`}
    />
  );
}
