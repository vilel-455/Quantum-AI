import React, { useMemo, useState } from "react";
import { PageContainer } from "../../design-system";

import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";
import { RightPanel } from "./RightPanel";
import { NotificationCenter } from "../notifications/NotificationCenter";

export type DashboardNavKey =
  | "dashboard"
  | "fund_account"
  | "transactions"
  | "withdraw"
  | "investment_plans"
  | "copy_trading"
  | "ai_trading_bots"
  | "my_investments"
  | "profit_history"
  | "referrals"
  | "account_settings"
  | "kyc"
  | "logout";

export interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
  /** Initial active navigation key. */
  initialActiveNav?: DashboardNavKey;
  onLogout?: () => void;
}

export function DashboardLayout({
  children,
  className,
  initialActiveNav = "dashboard",
  onLogout,
}: DashboardLayoutProps) {
  const [activeNav, setActiveNav] = useState<DashboardNavKey>(initialActiveNav);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleNavigate = (key: DashboardNavKey) => {
    if (key === 'logout') {
      onLogout?.();
    } else {
      setActiveNav(key);
    }
    setIsMobileSidebarOpen(false);
  };

  const pageContainerProps = useMemo(() => {
    return {
      paddingY: "xl",
      className: "flex-1",
    } as const;
  }, []);

  return (
    <div className={className}>
      <div className="min-h-screen bg-[#F6F8FC] text-[#1F2937] transition-colors duration-300 dark:bg-[#070B19] dark:text-white">
        {/* Sidebar (fixed desktop + drawer mobile) */}
        <Sidebar
          activeNav={activeNav}
          onNavigate={handleNavigate}
          isMobileOpen={isMobileSidebarOpen}
          onMobileOpenChange={setIsMobileSidebarOpen}
        />

        {/* Main content area - offset by sidebar width on desktop */}
        <div className="flex min-h-screen flex-col lg:ml-[280px]">
          <TopNavbar
            activeNav={activeNav}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onNavigate={handleNavigate}
          />

          <main className="flex-1">
            <div className="mx-auto w-full">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
                <PageContainer {...pageContainerProps}>
                  <div className="space-y-6">
                    <NotificationCenter />
                    {children}
                  </div>
                </PageContainer>

                {/* Right utility panel (desktop only styling) */}
                <div className="hidden lg:block">
                  <RightPanel activeNav={activeNav} />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
