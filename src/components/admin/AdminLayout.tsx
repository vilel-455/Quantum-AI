import React from 'react';
import { PageContainer } from '../../design-system';
import { AdminSidebar } from './AdminSidebar';

import type { AdminNavKey } from './types';

export interface AdminLayoutProps {
  children: React.ReactNode;
  activeNav?: AdminNavKey;
  onNavigate?: (key: AdminNavKey) => void;
}

export function AdminLayout({ children, activeNav = 'admin_dashboard', onNavigate }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-[#070B19] text-white">
      <AdminSidebar activeNav={activeNav} onNavigate={onNavigate} />
      <div className="flex min-h-screen flex-col lg:ml-[280px]">
        <main className="flex-1">
          <PageContainer paddingY="xl" className="flex-1">
            {children}
          </PageContainer>
        </main>
      </div>
    </div>
  );
}

