import React, { useEffect, useState } from 'react';
import { LoadingSkeleton } from '../../design-system';
import { fetchIsAdmin } from './lib/adminAuth';
import type { AdminNavKey } from './types';
import { AdminDashboardOverview } from './pages/AdminDashboardOverview';
import { PlaceholderAdminPage } from './pages/PlaceholderAdminPage';
import { KycAdminPage } from './pages/KycAdminPage';

export function AdminRouter({
  currentPage,
  setCurrentPage,
  session,
}: {
  currentPage: string;
  setCurrentPage: (p: string) => void;
  session: any;
}) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const isAdminRoute =
    currentPage === 'admin_dashboard' ||
    currentPage === 'admin_users' ||
    currentPage === 'admin_deposits' ||
    currentPage === 'admin_withdrawals' ||
    currentPage === 'admin_transactions' ||
    currentPage === 'admin_investment_plans' ||
    currentPage === 'admin_kyc_requests' ||
    currentPage === 'admin_support_tickets' ||
    currentPage === 'admin_newsletter' ||
    currentPage === 'admin_settings' ||
    currentPage === 'admin_logout';

  useEffect(() => {
    let mounted = true;
    if (!isAdminRoute) return;
    if (!session) return;

    (async () => {
      const ok = await fetchIsAdmin();
      if (!mounted) return;
      setIsAdmin(ok);
      if (!ok && currentPage !== 'admin_logout') {
        setCurrentPage('dashboard');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isAdminRoute, session, currentPage, setCurrentPage]);

  if (!isAdminRoute) {
    // Not an admin page: fall back to normal auth pages handled by App.tsx
    // (This component is inserted as the fallback branch in App.tsx.)
    return null;
  }

  if (currentPage === 'admin_logout') {
    // actual logout is done in AdminSidebar; this is a safety fallback.
    setCurrentPage('login');
    return null;
  }

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#070B19] text-white p-6">
        <div className="max-w-4xl mx-auto">
          <LoadingSkeleton variant="card" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#070B19] text-white p-6">
        <div className="max-w-4xl mx-auto rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-xl font-semibold">Unauthorized</h1>
          <p className="mt-2 text-sm text-white/70">You do not have admin access.</p>
        </div>
      </div>
    );
  }

  const navKey = currentPage.replace('admin_', 'admin_') as AdminNavKey;

  switch (currentPage as any as AdminNavKey) {
    case 'admin_dashboard':
      return <AdminDashboardOverview />;
    case 'admin_users':
      return <PlaceholderAdminPage navKey={'admin_users'} title={'User Management'} />;
    case 'admin_deposits':
      return <PlaceholderAdminPage navKey={'admin_deposits'} title={'Deposit Management'} />;
    case 'admin_withdrawals':
      return (
        <PlaceholderAdminPage navKey={'admin_withdrawals'} title={'Withdrawal Management'} />
      );
    case 'admin_transactions':
      return <PlaceholderAdminPage navKey={'admin_transactions'} title={'Transaction Ledger'} />;
    case 'admin_investment_plans':
      return (
        <PlaceholderAdminPage navKey={'admin_investment_plans'} title={'Investment Plan Management'} />
      );
    case 'admin_kyc_requests':
      return <KycAdminPage />;
    case 'admin_support_tickets':
      return <PlaceholderAdminPage navKey={'admin_support_tickets'} title={'Support Tickets'} />;
    case 'admin_newsletter':
      return <PlaceholderAdminPage navKey={'admin_newsletter'} title={'Newsletter Subscribers'} />;
    case 'admin_settings':
      return <PlaceholderAdminPage navKey={'admin_settings'} title={'Settings'} />;
    default:
      return <AdminDashboardOverview />;
  }
}

