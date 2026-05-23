import type { AppNavItem } from "@/lib/app-nav";

type AppNavIconProps = {
  icon: AppNavItem["iconKey"];
  active?: boolean;
};

export function AppNavIcon({ icon, active = false }: AppNavIconProps) {
  const className = active ? "text-[var(--accent)]" : "text-[var(--muted)]";

  switch (icon) {
    case "home":
      return (
        <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "assignments":
      return (
        <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 9h6M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "homework":
      return (
        <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 5h9a2 2 0 0 1 2 2v12l-3.5-2L12 19l-2.5-2L6 19V7a2 2 0 0 1 2-2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "rooms":
      return (
        <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="4" y="7" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "progress":
      return (
        <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M5 18V8M12 18V5M19 18v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "students":
      return (
        <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path d="M16 8.5a2.5 2.5 0 1 1 0 5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M18.5 19c0-2-1.3-3.7-3.5-4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "review":
      return (
        <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="m8.5 12.5 2.5 2.5L16 10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "materials":
      return (
        <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 7.5 12 4l7 3.5V16.5L12 20l-7-3.5V7.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M12 11.5V20" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "marketplace":
      return (
        <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 8h16l-1.2 10.5a1 1 0 0 1-1 .8H6.2a1 1 0 0 1-1-.8L4 8Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M8 8V6a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
  }
}
