import React from 'react';
import { Badge, Button, Card, Divider } from '../../design-system';

import type { DashboardNavKey } from './DashboardLayout';

export interface SidebarProps {

  activeNav: DashboardNavKey;
  onNavigate: (key: DashboardNavKey) => void;
  isMobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

type NavItem = {
  key: DashboardNavKey;
  label: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: 'MAIN',
    items: [
      { key: 'dashboard', label: 'Dashboard' },
      { key: 'fund_account', label: 'Fund Account' },
      { key: 'transactions', label: 'Transactions' },
      { key: 'withdraw', label: 'Withdraw' },
    ],
  },
  {
    title: 'INVESTMENTS',
    items: [
      { key: 'investment_plans', label: 'Investment Plans' },
      { key: 'copy_trading', label: 'Copy Trading' },
      { key: 'ai_trading_bots', label: 'AI Trading Bots' },
      { key: 'my_investments', label: 'My Investments' },
      { key: 'profit_history', label: 'Profit History' },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { key: 'referrals', label: 'Referrals' },
      { key: 'account_settings', label: 'Account Settings' },
      { key: 'kyc', label: 'KYC Verification' },
      { key: 'logout', label: 'Logout' },
    ],
  },
];

function SidebarNavButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? 'w-full rounded-lg bg-[#E53E3E]/10 text-[#E53E3E] px-3 py-2 text-left text-sm font-semibold transition-colors'
          : 'w-full rounded-lg text-[#1A365D] hover:bg-[#E53E3E]/10 hover:text-[#E53E3E] px-3 py-2 text-left text-sm font-semibold transition-colors dark:text-white dark:hover:bg-white/10'
      }
    >
      {label}
    </button>
  );
}


export function Sidebar({
  activeNav,
  onNavigate,
  isMobileOpen,
  onMobileOpenChange,
}: SidebarProps) {
  const sidebarContent = (
    <div className="flex h-full flex-col gap-6 transition-colors duration-300">

      {/* Logo */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#E53E3E]/10 flex items-center justify-center">
            <span className="text-[#E53E3E] font-bold">T</span>
          </div>
          <div>
            <div className="text-[#E53E3E] font-bold tracking-[0.25em] text-sm">TESLA</div>
            <div className="text-[#1A365D] font-bold">Dashboard</div>
          </div>
        </div>
      </div>

      {/* User profile card */}
      <Card className="mx-4 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-[#070B19]/5 flex items-center justify-center dark:bg-white/5">
            <span className="text-[#1A365D] font-bold">U</span>
          </div>
          <div className="min-w-0">
            <div className="font-bold text-[#1A365D]">User</div>
            <div className="text-xs text-gray-600 truncate dark:text-gray-300">KYC: Pending</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <Badge variant="warning">KYC</Badge>
          <Badge variant="info">Secure</Badge>
        </div>
      </Card>

      <Divider className="mx-4" />

      {/* Wallet summary card */}
      <Card className="mx-4 rounded-xl p-4">
        <div className="text-sm font-semibold text-gray-700">Wallet Summary</div>
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600 dark:text-gray-300">Available</div>
            <div className="font-bold text-[#1A365D]">$0.00</div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs text-gray-600 dark:text-gray-300">Invested</div>
            <div className="font-bold text-[#E53E3E]">$0.00</div>
          </div>
        </div>
        <div className="mt-4">
          <Button variant="primary" size="sm" className="w-full">
            Fund
          </Button>
        </div>
      </Card>

      {/* Navigation */}
      <nav className="px-2 pb-6">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-5">
            <div className="px-3 text-xs font-bold tracking-widest text-gray-500">
              {group.title}
            </div>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => (
                <SidebarNavButton
                  key={item.key}
                  active={activeNav === item.key}
                  label={item.label}
                  onClick={() => {
                    onNavigate(item.key);
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Mobile drawer footer */}
      <div className="px-4 pb-4 text-xs text-gray-500 dark:text-gray-300">
        No database connection.
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-[280px] lg:border-r lg:border-[#E5E7EB] lg:bg-white/70 lg:backdrop-blur-sm transition-colors duration-300 dark:bg-[#070B19]/60 dark:border-white/10 lg:flex">

        <div className="w-full overflow-y-auto">{sidebarContent}</div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={
          'fixed inset-0 z-50 lg:hidden transition-opacity ' +
          (isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0')
        }
        aria-hidden={!isMobileOpen}
      >
        <button
          className="absolute inset-0 bg-black/40"
          onClick={() => onMobileOpenChange(false)}
          aria-label="Close sidebar"
        />
        <div
          className={
            'absolute left-0 top-0 h-full w-[320px] max-w-[85vw] bg-white shadow-2xl transition-transform ' +
            (isMobileOpen ? 'translate-x-0' : '-translate-x-full')
          }
        >
          <div className="h-full overflow-y-auto">{sidebarContent}</div>
        </div>
      </div>
    </>
  );
}

