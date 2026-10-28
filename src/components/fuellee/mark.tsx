export function Mark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="var(--color-fg)" />
      <path
        d="M32 10c-1.2 6.2-10 14.4-10 24.2a10 10 0 0 0 20 0c0-6.2-4.2-12.2-7.2-16.4"
        fill="none"
        stroke="var(--color-amber)"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32 42.5 45 27"
        fill="none"
        stroke="var(--color-pine)"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <circle cx="32" cy="42.5" r="3.1" fill="var(--color-mist)" />
    </svg>
  );
}
