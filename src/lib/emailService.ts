import { supabase } from "./supabase";
import { createUserNotification } from "./notifications";

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const RESEND_FROM = import.meta.env.VITE_RESEND_FROM || "Quantum AI <onboarding@resend.dev>";

export type EmailTemplatePayload = {
  to: string;
  subject: string;
  html: string;
};

async function sendEmail(payload: EmailTemplatePayload): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    return { ok: false, error: "Email service is not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!response.ok) {
      const data = await response.text();
      return { ok: false, error: data || "Unable to send email" };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to send email",
    };
  }
}

async function getUserEmail(userId: string): Promise<string | null> {
  const { data, error } = await supabase.from("profiles").select("email").eq("id", userId).maybeSingle();

  if (error || !data?.email) {
    return null;
  }

  return data.email as string;
}

async function sendEmailWithNotification({
  userId,
  to,
  subject,
  html,
  notificationTitle,
  notificationMessage,
  notificationType,
}: {
  userId: string;
  to: string;
  subject: string;
  html: string;
  notificationTitle: string;
  notificationMessage: string;
  notificationType: string;
}): Promise<{ ok: boolean; error?: string }> {
  const emailResult = await sendEmail({ to, subject, html });

  await createUserNotification({
    userId,
    title: notificationTitle,
    message: notificationMessage,
    type: notificationType as any,
  });

  if (!emailResult.ok) {
    return { ok: true, error: emailResult.error };
  }

  return { ok: true };
}

export async function sendDepositApprovedEmail(userId: string, depositId: string): Promise<{ ok: boolean; error?: string }> {
  const to = await getUserEmail(userId);
  if (!to) {
    return { ok: true };
  }

  return sendEmailWithNotification({
    userId,
    to,
    subject: "Deposit Approved",
    html: `<p>Your deposit <strong>${depositId}</strong> has been approved.</p>`,
    notificationTitle: "Deposit approved",
    notificationMessage: `Your deposit (${depositId}) has been approved.`,
    notificationType: "Deposit Approved",
  });
}

export async function sendWithdrawalApprovedEmail(userId: string, withdrawalId: string): Promise<{ ok: boolean; error?: string }> {
  const to = await getUserEmail(userId);
  if (!to) {
    return { ok: true };
  }

  return sendEmailWithNotification({
    userId,
    to,
    subject: "Withdrawal Approved",
    html: `<p>Your withdrawal <strong>${withdrawalId}</strong> has been approved.</p>`,
    notificationTitle: "Withdrawal approved",
    notificationMessage: `Your withdrawal (${withdrawalId}) has been approved.`,
    notificationType: "Withdrawal Approved",
  });
}

export async function sendInvestmentStartedEmail(userId: string, investmentId: string): Promise<{ ok: boolean; error?: string }> {
  const to = await getUserEmail(userId);
  if (!to) {
    return { ok: true };
  }

  return sendEmailWithNotification({
    userId,
    to,
    subject: "Investment Started",
    html: `<p>Your investment <strong>${investmentId}</strong> has started.</p>`,
    notificationTitle: "Investment started",
    notificationMessage: `Your investment (${investmentId}) has started.`,
    notificationType: "Investment Started",
  });
}

export async function sendProfitPaidEmail(userId: string, amount: string): Promise<{ ok: boolean; error?: string }> {
  const to = await getUserEmail(userId);
  if (!to) {
    return { ok: true };
  }

  return sendEmailWithNotification({
    userId,
    to,
    subject: "Profit Paid",
    html: `<p>Your daily profit of <strong>${amount}</strong> has been paid.</p>`,
    notificationTitle: "Daily profit",
    notificationMessage: `Your daily profit of ${amount} has been paid.`,
    notificationType: "Daily Profit",
  });
}

export async function sendReferralBonusEmail(userId: string, amount: string): Promise<{ ok: boolean; error?: string }> {
  const to = await getUserEmail(userId);
  if (!to) {
    return { ok: true };
  }

  return sendEmailWithNotification({
    userId,
    to,
    subject: "Referral Bonus",
    html: `<p>Your referral bonus of <strong>${amount}</strong> has been credited.</p>`,
    notificationTitle: "Referral bonus",
    notificationMessage: `Your referral bonus of ${amount} has been credited.`,
    notificationType: "Referral Bonus",
  });
}

export async function sendKycApprovedEmail(userId: string): Promise<{ ok: boolean; error?: string }> {
  const to = await getUserEmail(userId);
  if (!to) {
    return { ok: true };
  }

  return sendEmailWithNotification({
    userId,
    to,
    subject: "KYC Approved",
    html: `<p>Your KYC verification has been approved.</p>`,
    notificationTitle: "KYC approved",
    notificationMessage: "Your KYC verification has been approved.",
    notificationType: "KYC Approved",
  });
}

export async function sendKycRejectedEmail(userId: string): Promise<{ ok: boolean; error?: string }> {
  const to = await getUserEmail(userId);
  if (!to) {
    return { ok: true };
  }

  return sendEmailWithNotification({
    userId,
    to,
    subject: "KYC Rejected",
    html: `<p>Your KYC verification has been rejected. Please contact support.</p>`,
    notificationTitle: "KYC rejected",
    notificationMessage: "Your KYC verification has been rejected. Please contact support.",
    notificationType: "KYC Rejected",
  });
}
