import React from "react";
import { Badge } from "../design-system/primitives/Badge";
import { Card } from "../design-system/primitives/Card";
import { LoadingSkeleton } from "../design-system/primitives/LoadingSkeleton";
import type { Transaction } from "../types/auth";

interface TransactionHistoryProps {
  transactions: Transaction[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  currency?: string;
}

function formatMoney(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

function formatTransactionType(type: Transaction["type"]) {
  return type
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function getStatusVariant(status: Transaction["status"]) {
  switch (status) {
    case "completed":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "danger";
    default:
      return "info";
  }
}

export function TransactionHistory({
  transactions,
  loading = false,
  error = null,
  emptyMessage = "No transactions yet.",
  currency = "USD",
}: TransactionHistoryProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <LoadingSkeleton variant="card" />
        <LoadingSkeleton variant="card" />
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  if (transactions.length === 0) {
    return <div className="text-sm text-gray-600">{emptyMessage}</div>;
  }

  return (
    <Card className="overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Description</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="border-t border-gray-100">
                <td className="px-4 py-3 text-gray-600">
                  {transaction.created_at
                    ? new Date(transaction.created_at).toLocaleString()
                    : "—"}
                </td>
                <td className="px-4 py-3 font-semibold text-[#1A365D]">
                  {formatTransactionType(transaction.type)}
                </td>
                <td className="px-4 py-3">
                  {formatMoney(Number(transaction.amount) || 0, currency)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={getStatusVariant(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {transaction.description || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
