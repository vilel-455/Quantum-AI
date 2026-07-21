import React, { useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import type { AdminNavKey } from './types';

export interface AdminSidebarProps {
  activeNav: AdminNavKey;
  onNavigate?: (key: AdminNavKey) => void;
}

type NavItem = { key: AdminNavKey; label: string };

type NavGroup = { title: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    title: 'Dashboard',
    items: [
      { key: 'admin_dashboard', label: 'Dashboard' },
      { key: 'admin_users', label: 'Users' },
      { key: 'admin_deposits', label: 'Deposits' },
      { key: 'admin_withdrawals', label: 'Withdrawals' },
      { key: 'admin_transactions', label: 'Transactions' },
      { key: 'admin_investment_plans', label: 'Investment Plans' },
      { key: 'admin_kyc_requests', label: 'KYC Requests' },
    ],
  },
  {
    title: 'Support',
    items: [
      { key: 'admin_support_tickets', label: 'Support Tickets' },
      { key: 'admin_newsletter', label: 'Newsletter' },
    ],
  },
  {
    title: 'Account',
    items: [
      { key: 'admin_settings', label: 'Settings' },
      { key: 'admin_logout', label: 'Logout' },
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
          ? 'w-full rounded-lg bg-[#E53E3E]/20 text-white px-3 py-2 text-left text-sm font-semibold transition-colors'
          : 'w-full rounded-lg text-white/80 hover:bg-white/10 hover:text-white px-3 py-2 text-left text-sm font-semibold transition-colors'
      }
    >
      {label}
    </button>
  );
}

export function AdminSidebar({ activeNav, onNavigate }: AdminSidebarProps) {
  const handleNavigate = useMemo(() => {
    return async (key: AdminNavKey) => {
      if (key === 'admin_logout') {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
        } catch {
          // no-op: UI still navigates
        } finally {
          try {
            window.localStorage.removeItem('sb-access-token');
            window.localStorage.removeItem('sb-refresh-token');
            window.localStorage.removeItem('sb-session');
          } catch {
            // ignore
          }
          try {
            window.sessionStorage.clear();
          } catch {
            // ignore
          }
          onNavigate?.('admin_logout');
        }
        return;
      }
      onNavigate?.(key);
    };
  }, [onNavigate]);

  const sidebarContent = (
    <div className="flex h-full flex-col gap-6 transition-colors duration-300">
      <div className="px-4 pt-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#E53E3E]/20 flex items-center justify-center">
            <span className="text-[#E53E3E] font-bold">T</span>
          </div>
          <div>
            <div className="text-[#E53E3E] font-bold tracking-[0.25em] text-sm">TESLA</div>
            <div className="text-white font-bold">Admin Dashboard</div>
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs font-bold tracking-widest text-white/60">ADMIN ACCESS</div>
          <div className="mt-2 text-sm font-semibold text-white/90">Secure operations</div>
          <div className="mt-1 text-xs text-white/60">Only verified administrators</div>
        </div>
      </div>

      <div className="px-2 pb-6">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-5">
            <div className="px-3 text-xs font-bold tracking-widest text-white/50">{group.title}</div>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => (
                <SidebarNavButton
                  key={item.key}
                  active={activeNav === item.key}
                  label={item.label}
                  onClick={() => {
                    void handleNavigate(item.key);
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-4 text-xs text-white/50">Admin panel</div>
    </div>
  );

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-[280px] lg:flex lg:flex-col lg:border-r lg:border-white/10 lg:bg-[#070B19]">
      <div className="w-full overflow-y-auto">{sidebarContent}</div>
    </aside>
  );
}

