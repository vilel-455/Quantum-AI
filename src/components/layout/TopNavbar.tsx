import React from "react";
import { Avatar, Badge, Button, Card } from "../../design-system";

import type { DashboardNavKey } from "./DashboardLayout";

export interface TopNavbarProps {
  activeNav: DashboardNavKey;
  onOpenMobileSidebar: () => void;
  onNavigate: (key: DashboardNavKey) => void;
}

export function TopNavbar({ activeNav, onOpenMobileSidebar }: TopNavbarProps) {
  const THEME_KEY = "quantum_dashboard_theme";

  const [theme, setTheme] = React.useState<"light" | "dark">(() => {
    const saved =
      typeof window !== "undefined"
        ? window.localStorage.getItem(THEME_KEY)
        : null;
    if (saved === "light" || saved === "dark") return saved;
    return "light";
  });

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-[#F6F8FC]/70 backdrop-blur-sm transition-colors duration-300 dark:bg-[#070B19]/60 dark:border-white/10">
      <div className="mx-auto flex h-16 items-center gap-4 px-4">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onOpenMobileSidebar}
        >
          Menu
        </Button>

        {/* Greeting */}
        <div className="hidden sm:block">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Welcome back
          </div>
          <div className="text-sm font-semibold text-[#1A365D] dark:text-white">
            Premium Fintech Dashboard
          </div>
        </div>

        {/* Search */}
        <div className="flex-1">
          <input
            className="w-full rounded-full border border-gray-100 bg-white px-4 py-2 text-sm outline-none placeholder-gray-400 focus:border-[#E53E3E]/50 focus:ring-2 focus:ring-[#E53E3E]/20 dark:bg-white/5 dark:border-white/10 dark:text-white"
            placeholder="Search investments, bots, transactions..."
          />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            Notifications
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="transition-colors"
          >
            {theme === "light" ? "Light" : "Dark"}
          </Button>

          <Badge variant="warning">KYC</Badge>

          <div className="flex items-center gap-2">
            <Avatar
              alt="User"
              fallback="U"
              size="sm"
              className="border border-gray-100 bg-white/70 dark:bg-white/5 dark:border-white/10"
            />
            <div className="hidden md:block">
              <div className="text-sm font-semibold">Username</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">
                Active
              </div>
            </div>
          </div>

          <div className="hidden sm:block">
            <Button variant="ghost" size="sm">
              Menu
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
