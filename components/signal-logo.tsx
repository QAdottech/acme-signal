export function SignalLogo({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="28" height="28" rx="7" fill="#111111" />
      <rect x="6" y="14" width="3.2" height="8" rx="1" fill="white" />
      <rect x="12.4" y="10" width="3.2" height="12" rx="1" fill="white" />
      <rect x="18.8" y="6" width="3.2" height="16" rx="1" fill="white" />
    </svg>
  );
}
