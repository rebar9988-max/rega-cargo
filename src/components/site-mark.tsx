/** The original logo asset is immutable. */
export function Mark({ className = "size-14" }: { className?: string }) {
  return (
    <img
      src="/rega-logo-168.webp"
      alt="R&L"
      width={56}
      height={56}
      decoding="async"
      className={`${className} shrink-0 rounded-xl`}
    />
  );
}
