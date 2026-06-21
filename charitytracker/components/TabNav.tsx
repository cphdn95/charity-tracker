"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Donations" },
  { href: "/presenter", label: "Presenter" },
];

// Shared top bar: two tabs (Donations / Presenter) plus an Admin button that
// goes to the passcode-protected developer view.
export default function TabNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-gray-800 bg-gray-900/70 sticky top-0 z-20 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between gap-4">
        <div className="flex items-center">
          <span className="font-bold mr-4 flex items-center gap-2 whitespace-nowrap">
            <span>💛</span>
            <span className="hidden sm:inline">Grace's Birthday Charities</span>
          </span>
          <nav className="flex items-center">
            {TABS.map((t) => {
              const active = pathname === t.href;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    active
                      ? "border-green-500 text-green-400"
                      : "border-transparent text-gray-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <Link
          href="/admin"
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-colors whitespace-nowrap"
        >
          🔒 Admin
        </Link>
      </div>
    </div>
  );
}
