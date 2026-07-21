import React from "react";
import {
  Avatar,
  Badge,
  Card,
  Divider,
  LoadingSkeleton,
} from "../../design-system";

import type { DashboardNavKey } from "./DashboardLayout";

export interface RightPanelProps {
  activeNav: DashboardNavKey;
}

function PlaceholderCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="mb-4 rounded-xl p-5">
      <div className="text-sm font-bold text-[#1A365D]">{title}</div>
      <div className="mt-3">{children}</div>
    </Card>
  );
}

export function RightPanel({ activeNav }: RightPanelProps) {
  return (
    <aside className="sticky top-16 pr-4">
      <PlaceholderCard title="Quick Actions">
        <div className="flex flex-col gap-2">
          <div className="h-10 rounded-lg bg-[#E53E3E]/10" />
          <div className="h-10 rounded-lg bg-[#3182CE]/10" />
          <div className="h-10 rounded-lg bg-[#E53E3E]/10" />
        </div>
      </PlaceholderCard>

      <PlaceholderCard title="Verification Status">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="warning">Pending</Badge>
          <div className="text-xs text-gray-500 dark:text-gray-300">
            Review required
          </div>
        </div>
        <div className="mt-3">
          <LoadingSkeleton variant="text" lines={2} />
        </div>
      </PlaceholderCard>

      <PlaceholderCard title="Profile Summary">
        <div className="flex items-center gap-3">
          <Avatar alt="User" fallback="U" size="md" />
          <div>
            <div className="font-bold text-[#1A365D] dark:text-white">User</div>
            <div className="text-xs text-gray-500 dark:text-gray-300">
              No database connection.
            </div>
          </div>
        </div>
        <Divider className="my-4" />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-300">Membership</span>
            <span className="font-semibold">Basic</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-300">Risk level</span>
            <span className="font-semibold text-[#E53E3E]">Moderate</span>
          </div>
        </div>
      </PlaceholderCard>

      <PlaceholderCard title="Latest Activity">
        <div className="space-y-3">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="rounded-xl border border-gray-100 bg-white/50 p-3 dark:bg-white/5 dark:border-white/10"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-[#1A365D] dark:text-white">
                  Activity #{idx + 1}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-300">
                  Today
                </div>
              </div>
              <div className="mt-2">
                <LoadingSkeleton variant="text" lines={2} />
              </div>
            </div>
          ))}
        </div>

        {/* keep lint happy for unused prop in the future */}
        <div className="hidden">{activeNav}</div>
      </PlaceholderCard>
    </aside>
  );
}
