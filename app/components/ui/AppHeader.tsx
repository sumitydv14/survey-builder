"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M1.5 2.75A.75.75 0 0 1 2.25 2h11.5a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-.75.75H2.25A.75.75 0 0 1 1.5 5.25Zm0 6A.75.75 0 0 1 2.25 8h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 1.5 8.75Zm0 3A.75.75 0 0 1 2.25 11h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75ZM10.5 8a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3A.75.75 0 0 1 10.5 8Zm0 3a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75Z" />
      </svg>
    ),
  },
  {
    label: "New Survey",
    href: "/dashboard?new=1",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" />
      </svg>
    ),
  },
];

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const isActive = (href: string) => pathname === href.split("?")[0];

  return (
    <header className="h-14 bg-[#161b22] border-b border-[#21262d] sticky top-0 z-50 flex-shrink-0">
      <div className="max-w-screen-2xl mx-auto h-full px-4 flex items-center justify-between gap-4">

        {/* Left: Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#238636] to-[#58a6ff] flex items-center justify-center text-xs font-black text-white shadow-md group-hover:shadow-[#238636]/30 transition-shadow">
            S
          </div>
          <span className="text-[#e6edf3] font-semibold text-sm hidden sm:block">Survey Builder</span>
        </Link>

        {/* Center: Nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.filter(
  (item) => !(item.href === "/dashboard" && pathname === "/dashboard")
).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                isActive(item.href)
                  ? "bg-[#21262d] text-[#e6edf3]"
                  : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]/60"
              }`}
            >
              <span className={isActive(item.href) ? "text-[#58a6ff]" : ""}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Breadcrumb pill + menu */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Active page breadcrumb pill */}
          <ActiveBreadcrumb pathname={pathname} />

          {/* Hamburger / menu button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 ${
                menuOpen ? "bg-[#21262d] text-[#e6edf3]" : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]"
              }`}
              title="Menu"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                {menuOpen ? (
                  <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.042.018.749.749 0 0 1 .018 1.042L9.06 8l3.22 3.22a.749.749 0 0 1-.018 1.042.749.749 0 0 1-1.042.018L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
                ) : (
                  <path d="M1 2.75A.75.75 0 0 1 1.75 2h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75Zm0 5A.75.75 0 0 1 1.75 7h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.75ZM1.75 12h12.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5Z" />
                )}
              </svg>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 top-10 w-56 bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                {/* Menu header */}
                <div className="px-3 py-2.5 border-b border-[#21262d]">
                  <p className="text-[10px] font-semibold text-[#484f58] uppercase tracking-wider">Navigation</p>
                </div>

                {/* Nav items */}
                <div className="p-1.5 space-y-0.5">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => { router.push(item.href); setMenuOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all duration-150 ${
                        isActive(item.href)
                          ? "bg-[#21262d] text-[#e6edf3]"
                          : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]/60"
                      }`}
                    >
                      <span className={`flex-shrink-0 ${isActive(item.href) ? "text-[#58a6ff]" : ""}`}>{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {isActive(item.href) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff] flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Divider + extra links */}
                <div className="border-t border-[#21262d] p-1.5 space-y-0.5">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]/60 transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
                    </svg>
                    GitHub
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" className="ml-auto opacity-40">
                      <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z" />
                    </svg>
                  </a>
                </div>

                {/* Version footer */}
                <div className="px-3 py-2 border-t border-[#21262d] bg-[#0d1117]/40">
                  <p className="text-[10px] text-[#484f58] font-mono">Survey Builder v1.0</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Breadcrumb pill ──────────────────────────────────────────────────────────
function ActiveBreadcrumb({ pathname }: { pathname: string }) {
  const crumbs: Record<string, { label: string; color: string }> = {
    "/dashboard": { label: "Dashboard", color: "text-[#58a6ff] bg-[#1f6feb]/10 border-[#1f6feb]/20" },
    "/login":     { label: "Login",     color: "text-[#8b949e] bg-[#21262d] border-[#30363d]" },
  };

  // Editor / preview pages
  if (pathname.includes("/editor"))  return <Pill label="Editor"  color="text-[#3fb950] bg-[#238636]/10 border-[#238636]/20" />;
  if (pathname.includes("/preview")) return <Pill label="Preview" color="text-[#e3b341] bg-[#bf8700]/10 border-[#bf8700]/20" />;

  const match = crumbs[pathname];
  if (!match) return null;
  return <Pill label={match.label} color={match.color} />;
}

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold font-mono border ${color}`}>
      {label}
    </span>
  );
}