import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Button,
  LoadingSkeleton,
  Divider,
  Badge,
} from "../../../design-system";
import type { Plan } from "../../../lib/plans";
import { getActivePlans } from "../../../lib/plans";
import { getWallet } from "../../../lib/wallets";
import { createInvestment } from "../../../lib/investments";
import {
  parseAmount,
  validateAmountAgainstPlan,
} from "../../../lib/investmentWorkflow";
import { supabase } from "../../../lib/supabase";
import { getRecentTransactions } from "../../../lib/transactions";
import { TransactionHistory } from "../../TransactionHistory";

type ToastType = "success" | "error";

function useToasts() {
  const [toasts, setToasts] = useState<
    Array<{ id: string; type: ToastType; message: string }>
  >([]);

  const push = (type: ToastType, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  return {
    toasts,
    pushSuccess: (m: string) => push("success", m),
    pushError: (m: string) => push("error", m),
  };
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

export function InvestmentPlansView() {
  const { toasts, pushSuccess, pushError } = useToasts();

  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletCurrency, setWalletCurrency] = useState<string>("USD");

  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(
    null,
  );
  const [transactions, setTransactions] = useState<any[]>([]);

  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === selectedPlanId) ?? null,
    [plans, selectedPlanId],
  );

  const [amountInput, setAmountInput] = useState<string>("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!session?.user?.id) {
        pushError("Please login to invest.");
        return;
      }
      setUserId(session.user.id);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const loadPlans = async () => {
    setPlansLoading(true);
    setPlansError(null);
    try {
      const active = await getActivePlans();
      setPlans(active);
      if (active[0]?.id) {
        setSelectedPlanId((prev) => prev || active[0].id);
      }
    } catch (e) {
      setPlansError(e instanceof Error ? e.message : "Unable to load plans.");
    } finally {
      setPlansLoading(false);
    }
  };

  const refreshWalletAndInvestments = async () => {
    if (!userId) return;

    setWalletLoading(true);
    setWalletError(null);
    setTransactionsLoading(true);
    setTransactionsError(null);

    try {
      const wallet = await getWallet(userId);
      setWalletBalance(Number(wallet.balance) || 0);
      setWalletCurrency(wallet.currency || "USD");

      const txns = await getRecentTransactions(userId, 10);
      setTransactions(txns);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Unable to refresh dashboard data.";
      setWalletError(msg);
      setTransactionsError(msg);
    } finally {
      setWalletLoading(false);
      setTransactionsLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    if (!userId) return;
    void refreshWalletAndInvestments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const validateClientSide = () => {
    if (!selectedPlan)
      return { ok: false as const, message: "Select an investment plan." };
    let amount: number;
    try {
      amount = parseAmount(amountInput);
    } catch (e) {
      return {
        ok: false as const,
        message: e instanceof Error ? e.message : "Invalid amount.",
      };
    }

    const minMax = validateAmountAgainstPlan({
      amount,
      planMin: selectedPlan.minimum,
      planMax: selectedPlan.maximum,
    });

    if (!minMax.ok) return { ok: false as const, message: minMax.message };

    if (amount > walletBalance)
      return { ok: false as const, message: "Insufficient wallet balance." };

    return { ok: true as const, amount };
  };

  const handleCreateInvestment = async () => {
    if (!userId) {
      pushError("Please login to invest.");
      return;
    }

    const validation = validateClientSide();
    if (!validation.ok) {
      pushError(validation.message);
      return;
    }

    if (!selectedPlan) {
      pushError("Select an investment plan.");
      return;
    }

    const amount = validation.amount;

    setSubmitLoading(true);
    try {
      await createInvestment(userId, selectedPlan.id, amount);

      pushSuccess("Investment created successfully.");

      await refreshWalletAndInvestments();

      setAmountInput("");
    } catch (e) {
      pushError(
        e instanceof Error ? e.message : "Unable to create investment.",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toasts */}
      <div className="fixed right-4 top-20 z-[100] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              t.type === "success"
                ? "rounded-xl bg-green-600 text-white px-4 py-3 text-sm shadow-lg"
                : "rounded-xl bg-red-600 text-white px-4 py-3 text-sm shadow-lg"
            }
          >
            {t.message}
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-stretch">
        <Card className="flex-1 p-5">
          <div className="text-sm font-semibold text-gray-700">
            Wallet balance
          </div>
          <div className="mt-2 text-3xl font-bold text-[#1A365D]">
            {walletLoading ? (
              <LoadingSkeleton variant="text" lines={1} />
            ) : (
              formatMoney(walletBalance, walletCurrency)
            )}
          </div>
          {walletError ? (
            <div className="mt-2 text-sm text-red-600">{walletError}</div>
          ) : null}
        </Card>

        <Card className="flex-1 p-5">
          <div className="text-sm font-semibold text-gray-700">Select plan</div>
          {plansLoading ? (
            <div className="mt-3 space-y-2">
              <LoadingSkeleton variant="text" lines={3} />
            </div>
          ) : plansError ? (
            <div className="mt-3 text-sm text-red-600">{plansError}</div>
          ) : (
            <div className="mt-3 space-y-3">
              <select
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#E53E3E]/20"
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title ?? p.name ?? `Plan ${p.id}`} (min {p.minimum}, max{" "}
                    {p.maximum ?? "∞"})
                  </option>
                ))}
              </select>

              {selectedPlan ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="info">ROI {selectedPlan.roi_percent}%</Badge>
                  <Badge variant="success">Min {selectedPlan.minimum}</Badge>
                  <Badge variant="warning">
                    Max {selectedPlan.maximum ?? "∞"}
                  </Badge>
                </div>
              ) : null}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-widest text-[#E53E3E]">
              Invest
            </div>
            <h2 className="mt-2 text-xl font-bold">Create a new investment</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter an amount within the selected plan’s limits and submit.
            </p>
          </div>
        </div>

        <Divider className="my-5" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <input
              inputMode="decimal"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#E53E3E]/20 focus:border-[#E53E3E]/30"
              placeholder={
                selectedPlan
                  ? `Min ${selectedPlan.minimum}`
                  : "Select a plan first"
              }
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
            />
            {selectedPlan ? (
              <div className="mt-2 text-xs text-gray-500">
                Plan limits: Min {selectedPlan.minimum} • Max{" "}
                {selectedPlan.maximum ?? "∞"}
              </div>
            ) : null}
          </div>

          <div>
            <Button
              className="w-full"
              loading={submitLoading}
              disabled={
                submitLoading || plansLoading || walletLoading || !selectedPlan
              }
              onClick={() => void handleCreateInvestment()}
            >
              Submit Investment
            </Button>
            <div className="mt-2 text-xs text-gray-500">
              {walletLoading
                ? "Checking balance…"
                : walletBalance
                  ? "Wallet verified"
                  : "Wallet empty"}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-widest text-[#1A365D]">
              My investments
            </div>
            <h2 className="mt-2 text-xl font-bold">Recent activity</h2>
          </div>
        </div>
        <Divider className="my-5" />

        <TransactionHistory
          transactions={transactions}
          loading={transactionsLoading}
          error={transactionsError}
          emptyMessage="No transactions yet."
          currency={walletCurrency}
        />
      </Card>
    </div>
  );
}
