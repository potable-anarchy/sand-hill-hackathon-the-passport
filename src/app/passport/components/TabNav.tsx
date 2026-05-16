"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Itinerary", href: "/passport" },
  { label: "Concierge", href: "/passport/concierge" },
];

export function TabNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex border-t pt-3 pb-6"
      style={{
        borderColor: "var(--divider, #E8E4DC)",
        background: "var(--bg-cream, #FAF7F2)",
      }}
    >
      {TABS.map((tab) => {
        const isActive =
          tab.href === "/passport"
            ? pathname === "/passport"
            : pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="relative flex-1 py-2 text-center text-[13px] tracking-wide"
            style={{
              color: isActive
                ? "var(--ink-primary, #1F1E1A)"
                : "var(--ink-tertiary, #8E8A82)",
              fontWeight: isActive ? 500 : 400,
            }}
          >
            {tab.label}
            {isActive && (
              <span
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  bottom: "-12px",
                  width: "20px",
                  height: "2px",
                  background: "var(--accent-olive, #7F8E6F)",
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
