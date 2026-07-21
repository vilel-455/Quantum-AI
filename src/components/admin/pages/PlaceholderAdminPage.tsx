import React from 'react';
import { AdminLayout } from '../AdminLayout';
import type { AdminNavKey } from '../types';

export function PlaceholderAdminPage({ navKey, title }: { navKey: AdminNavKey; title: string }) {
  return (
    <AdminLayout activeNav={navKey}>
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E53E3E]">Admin</p>
          <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-white/70">This section will be implemented next.</p>
        </div>
      </div>
    </AdminLayout>
  );
}

