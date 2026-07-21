import { supabase } from "./supabase";
import type { Deposit } from "../types/deposits";
import type { Withdrawal } from "../types/withdrawals";
import { emitTransactionRefresh } from "./transactions";
import {
  sendDepositApprovedEmail,
  sendInvestmentStartedEmail,
  sendKycApprovedEmail,
  sendKycRejectedEmail,
  sendWithdrawalApprovedEmail,
} from "./emailService";
import { createUserNotification, type NotificationType } from "./notifications";

type AdminServiceError = {
  code: string;
  message: string;
};

type AdminServiceOk<T> = { ok: true; data: T };

type AdminServiceErr = { ok: false; error: AdminServiceError };


type AdminServiceResult<T> = AdminServiceOk<T> | AdminServiceErr;

type AdminRoleCheckRow = {
  role: string;
  account_status: string;
  verification_status: string;
};

type ProfilesSelect = Pick<AdminRoleCheckRow, "role" | "account_status" | "verification_status">;


function toError(code: string, message: string): AdminServiceErr {
  return { ok: false, error: { code, message } };
}

async function requireAdmin(): Promise<AdminServiceResult<{ adminId: string }>> {
  // ensure we only ever access adminRes.error in the ok:false branch
  type RequireAdminOk = { adminId: string };


  const { data: userRes, error: userError } = await supabase.auth.getUser();
  if (userError) return toError("AUTH_ERROR", userError.message);

  const adminId = userRes.user?.id;
  if (!adminId) return toError("NO_AUTH_USER", "Not authenticated.");

  const { data, error } = await supabase
    .from("profiles")
    .select("role, account_status, verification_status")
    .eq("id", adminId)
    .maybeSingle();

  if (error) return toError("DB_ERROR", error.message);
  if (!data) return toError("NO_PROFILE", "Admin profile not found.");

  if (data.role !== "admin")
    return toError("FORBIDDEN", "Current user is not an admin.");
  if (data.account_status !== "active")
    return toError("FORBIDDEN", "Admin account is not active.");
  if (data.verification_status !== "verified")
    return toError("FORBIDDEN", "Admin account is not verified.");

  return { ok: true, data: { adminId } };
}


type AdminLogDetails = Record<string, unknown>;

export async function logAdminAction(
  adminId: string,
  action: string,
  table: string,
  recordId: string,
  details: AdminLogDetails,
): Promise<AdminServiceResult<void>> {
  const { error } = await supabase
    .from("admin_logs")
    .insert([
      {
        admin_id: adminId,
        action,
        table_name: table,
        record_id: recordId,
        old_value: null,
        new_value: null,
        ip_address: null,
      },
    ]);

  if (error) return toError("LOG_FAILED", error.message);
  return { ok: true, data: undefined };
}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType = "System Announcement",
  metadata: Record<string, unknown> = {},
): Promise<AdminServiceResult<void>> {
  const result = await createUserNotification({
    userId,
    title,
    message,
    type,
    metadata,
  });

  if (!result.ok) return toError("NOTIFICATION_FAILED", result.error ?? "Failed to create notification.");
  return { ok: true, data: undefined };
}

export async function sendAnnouncement(
  target: "all" | "user",
  userId: string | null,
  title: string,
  message: string,
): Promise<AdminServiceResult<void>> {
  const adminRes = await requireAdmin();
  if (!adminRes.ok) return { ok: false as const, error: adminRes.error };

  let targetIds: string[] = [];

  if (target === "user" && userId) {
    targetIds = [userId];
  } else {
    const { data, error } = await supabase.from("profiles").select("id");
    if (error) return toError("ANNOUNCEMENT_FAILED", error.message);
    targetIds = (data ?? []).map((row: { id: string }) => row.id);
  }

  for (const targetUserId of targetIds) {
    await createNotification(targetUserId, title, message, "System Announcement", {
      sent_by: adminRes.data.adminId,
      target,
    });
  }

  await logAdminAction(
    adminRes.data.adminId,
    target === "user" ? "send_announcement_user" : "send_announcement_all",
    "notifications",
    target === "user" ? userId ?? "" : "all",
    { title, message, target },
  );

  return { ok: true, data: undefined };
}


async function getDepositForLog(depositId: string): Promise<Deposit | null> {
  const { data, error } = await supabase
    .from("deposits")
    .select("*")
    .eq("id", depositId)
    .maybeSingle();


  if (error) return null;
  return data ?? null;
}

async function getWithdrawalForLog(withdrawalId: string): Promise<Withdrawal | null> {
  const { data, error } = await supabase
    .from("withdrawals")
    .select("*")
    .eq("id", withdrawalId)
    .maybeSingle();


  if (error) return null;
  return data ?? null;
}

export async function approveDeposit(depositId: string): Promise<AdminServiceResult<void>> {
  const adminRes = await requireAdmin();
  if (!adminRes.ok) return { ok: false as const, error: adminRes.error };
  const adminId = adminRes.data.adminId;




  const depBefore = await getDepositForLog(depositId);


  if (!depBefore) return toError("NOT_FOUND", "Deposit not found.");

  const { error } = await supabase.rpc("approve_deposit", {
    p_deposit_id: depositId,
    p_admin_note: null,
  });

  if (error) return toError("DEPOSIT_APPROVE_FAILED", error.message);

  await logAdminAction(
    adminRes.data.adminId,
    "approve",
    "deposits",
    depositId,
    { user_id: depBefore.user_id, amount: depBefore.amount },
  );

  await createNotification(
    depBefore.user_id,
    "Deposit approved",
    `Your deposit (${depositId}) has been approved.`,
    "Deposit Approved",
    { deposit_id: depositId },
  );
  await sendDepositApprovedEmail(depBefore.user_id, depositId);

  return { ok: true, data: undefined };
}

export async function rejectDeposit(
  depositId: string,
  reason: string,
): Promise<AdminServiceResult<void>> {
  const adminRes = await requireAdmin();
  if (!adminRes.ok) return { ok: false as const, error: adminRes.error };


  const depBefore = await getDepositForLog(depositId);

  if (!depBefore) return toError("NOT_FOUND", "Deposit not found.");


  const { error } = await supabase.rpc("reject_deposit", {
    p_deposit_id: depositId,
    p_admin_note: reason,
  });

  if (error) return toError("DEPOSIT_REJECT_FAILED", error.message);

  await logAdminAction(
    adminRes.data.adminId,
    "reject",
    "deposits",
    depositId,
    { user_id: depBefore.user_id, reason },
  );

  await createNotification(
    depBefore.user_id,
    "Deposit rejected",
    `Your deposit (${depositId}) was rejected. Reason: ${reason}`,
    "Deposit Rejected",
    { deposit_id: depositId, reason },
  );

  return { ok: true, data: undefined };
}

export async function approveWithdrawal(
  withdrawalId: string,
): Promise<AdminServiceResult<void>> {
  const adminRes = await requireAdmin();
  if (!adminRes.ok) return { ok: false as const, error: adminRes.error };



  const wBefore = await getWithdrawalForLog(withdrawalId);
  if (!wBefore) return toError("NOT_FOUND", "Withdrawal not found.");

  const { error } = await supabase.rpc("approve_withdrawal", {
    p_withdrawal_id: withdrawalId,
    p_admin_note: null,
  });

  if (error) return toError("WITHDRAWAL_APPROVE_FAILED", error.message);

  emitTransactionRefresh();

  await logAdminAction(
    adminRes.data.adminId,
    "approve",
    "withdrawals",
    withdrawalId,
    { user_id: wBefore.user_id, amount: wBefore.amount },
  );

  await createNotification(
    wBefore.user_id,
    "Withdrawal approved",
    `Your withdrawal (${withdrawalId}) has been approved.`,
    "Withdrawal Approved",
    { withdrawal_id: withdrawalId },
  );
  await sendWithdrawalApprovedEmail(wBefore.user_id, withdrawalId);

  return { ok: true, data: undefined };
}

export async function rejectWithdrawal(
  withdrawalId: string,
  reason: string,
): Promise<AdminServiceResult<void>> {
  const adminRes = await requireAdmin();
  if (!adminRes.ok) return { ok: false as const, error: adminRes.error };



  const wBefore = await getWithdrawalForLog(withdrawalId);
  if (!wBefore) return toError("NOT_FOUND", "Withdrawal not found.");

  const { error } = await supabase.rpc("reject_withdrawal", {
    p_withdrawal_id: withdrawalId,
    p_admin_note: reason,
  });

  if (error) return toError("WITHDRAWAL_REJECT_FAILED", error.message);

  emitTransactionRefresh();

  await logAdminAction(
    adminRes.data.adminId,
    "reject",
    "withdrawals",
    withdrawalId,
    { user_id: wBefore.user_id, reason },
  );

  await createNotification(
    wBefore.user_id,
    "Withdrawal rejected",
    `Your withdrawal (${withdrawalId}) was rejected. Reason: ${reason}`,
    "Withdrawal Rejected",
    { withdrawal_id: withdrawalId, reason },
  );

  return { ok: true, data: undefined };
}

export async function activateInvestment(
  investmentId: string,
): Promise<AdminServiceResult<void>> {
  const adminRes = await requireAdmin();
  if (!adminRes.ok) return adminRes;

  const { error } = await supabase
    .from("investments")
    .update({ status: "Active" })
    .eq("id", investmentId);

  if (error) return toError("INVESTMENT_ACTIVATE_FAILED", error.message);

  await logAdminAction(adminRes.data.adminId, "activate", "investments", investmentId, {});
  await createNotification(
    (await supabase.from("investments").select("user_id").eq("id", investmentId).maybeSingle()).data?.user_id ?? "",
    "Investment started",
    `Your investment (${investmentId}) has started.`,
    "Investment Started",
    { investment_id: investmentId },
  );
  if ((await supabase.from("investments").select("user_id").eq("id", investmentId).maybeSingle()).data?.user_id) {
    await sendInvestmentStartedEmail(
      (await supabase.from("investments").select("user_id").eq("id", investmentId).maybeSingle()).data?.user_id ?? "",
      investmentId,
    );
  }

  return { ok: true, data: undefined };
}

export async function cancelInvestment(
  investmentId: string,
): Promise<AdminServiceResult<void>> {
  const adminRes = await requireAdmin();
  if (!adminRes.ok) return { ok: false as const, error: adminRes.error };


  const { error } = await supabase
    .from("investments")
    .update({ status: "cancelled" })
    .eq("id", investmentId);

  if (error) return toError("INVESTMENT_CANCEL_FAILED", error.message);

  await logAdminAction(adminRes.data.adminId, "cancel", "investments", investmentId, {});

  return { ok: true, data: undefined };
}

export async function suspendUser(
  userId: string,
): Promise<AdminServiceResult<void>> {
  const adminRes = await requireAdmin();
  if (!adminRes.ok) return { ok: false as const, error: adminRes.error };


  const { error } = await supabase
    .from("profiles")
    .update({ account_status: "suspended" })
    .eq("id", userId);

  if (error) return toError("USER_SUSPEND_FAILED", error.message);

  await logAdminAction(adminRes.data.adminId, "suspend", "profiles", userId, {});
  await createNotification(userId, "Account suspended", "Your account has been suspended by admin.", "Account Suspended");

  return { ok: true, data: undefined };
}

export async function activateUser(
  userId: string,
): Promise<AdminServiceResult<void>> {
  const adminRes = await requireAdmin();
  if (!adminRes.ok) return { ok: false as const, error: adminRes.error };


  const { error } = await supabase
    .from("profiles")
    .update({ account_status: "active" })
    .eq("id", userId);

  if (error) return toError("USER_ACTIVATE_FAILED", error.message);

  await logAdminAction(adminRes.data.adminId, "activate", "profiles", userId, {});
  await createNotification(userId, "Account activated", "Your account has been activated by admin.");

  return { ok: true, data: undefined };
}

export async function verifyUser(
  userId: string,
): Promise<AdminServiceResult<void>> {
  const adminRes = await requireAdmin();
  if (!adminRes.ok) return { ok: false as const, error: adminRes.error };


  const { error } = await supabase
    .from("profiles")
    .update({ verification_status: "verified" })
    .eq("id", userId);

  if (error) return toError("USER_VERIFY_FAILED", error.message);

  await logAdminAction(adminRes.data.adminId, "verify", "profiles", userId, {});
  await createNotification(userId, "KYC approved", "Your verification has been approved by admin.", "KYC Approved");
  await sendKycApprovedEmail(userId);

  return { ok: true, data: undefined };
}

export async function rejectUserVerification(
  userId: string,
): Promise<AdminServiceResult<void>> {
  const adminRes = await requireAdmin();
  if (!adminRes.ok) return { ok: false as const, error: adminRes.error };


  const { error } = await supabase
    .from("profiles")
    .update({ verification_status: "rejected" })
    .eq("id", userId);

  if (error) return toError("USER_REJECT_VERIFICATION_FAILED", error.message);

  await logAdminAction(adminRes.data.adminId, "reject_verification", "profiles", userId, {});
  await createNotification(userId, "KYC rejected", "Your verification was rejected by admin.", "KYC Rejected");
  await sendKycRejectedEmail(userId);

  return { ok: true, data: undefined };
}

export async function promoteAdmin(
  userId: string,
): Promise<AdminServiceResult<void>> {
  const adminRes = await requireAdmin();
  if (!adminRes.ok) return { ok: false as const, error: adminRes.error };


  const { error } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", userId);

  if (error) return toError("PROMOTE_ADMIN_FAILED", error.message);

  await logAdminAction(adminRes.data.adminId, "promote_admin", "profiles", userId, {});
  await createNotification(userId, "Admin access granted", "You have been promoted to admin by admin.");

  return { ok: true, data: undefined };
}

export async function demoteAdmin(
  userId: string,
): Promise<AdminServiceResult<void>> {
  const adminRes = await requireAdmin();
  if (!adminRes.ok) return { ok: false as const, error: adminRes.error };


  const { error } = await supabase
    .from("profiles")
    .update({ role: "user" })
    .eq("id", userId);

  if (error) return toError("DEMOTE_ADMIN_FAILED", error.message);

  await logAdminAction(adminRes.data.adminId, "demote_admin", "profiles", userId, {});
  await createNotification(userId, "Admin access removed", "Your admin access has been removed by admin.");

  return { ok: true, data: undefined };
}

export async function getAdminServiceVersion(): Promise<AdminServiceResult<string>> {
  return { ok: true, data: "1.0" };
}

