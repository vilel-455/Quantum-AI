import { supabase } from "./supabase";
import { createNotification, logAdminAction } from "./adminService";
import { sendKycApprovedEmail, sendKycRejectedEmail } from "./emailService";

export type KycDocumentType = "national_id" | "passport" | "driver_license" | "selfie" | "proof_of_address";
export type KycRequestStatus = "pending" | "verified" | "rejected";

export type KycRequestRecord = {
  id: string;
  user_id: string;
  document_type: KycDocumentType;
  document_url: string | null;
  selfie_url: string | null;
  address_url: string | null;
  status: KycRequestStatus;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type KycRequestWithProfile = KycRequestRecord & {
  profile?: {
    id: string;
    email: string | null;
    full_name: string | null;
    username: string | null;
  } | null;
};

type AdminServiceError = {
  code: string;
  message: string;
};

type AdminServiceResult<T> = { ok: true; data: T } | { ok: false; error: AdminServiceError };

function toError(code: string, message: string): AdminServiceResult<never> {
  return { ok: false, error: { code, message } };
}

function getStorageField(documentType: KycDocumentType): keyof Pick<KycRequestRecord, "document_url" | "selfie_url" | "address_url"> {
  switch (documentType) {
    case "selfie":
      return "selfie_url";
    case "proof_of_address":
      return "address_url";
    default:
      return "document_url";
  }
}

function getDisplayLabel(documentType: KycDocumentType): string {
  switch (documentType) {
    case "national_id":
      return "National ID";
    case "passport":
      return "Passport";
    case "driver_license":
      return "Driver License";
    case "selfie":
      return "Selfie";
    case "proof_of_address":
      return "Proof of Address";
    default:
      return documentType;
  }
}

async function requireAdmin(): Promise<AdminServiceResult<{ adminId: string }>> {
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
  if (data.role !== "admin") return toError("FORBIDDEN", "Current user is not an admin.");
  if (data.account_status !== "active") return toError("FORBIDDEN", "Admin account is not active.");
  if (data.verification_status !== "verified") return toError("FORBIDDEN", "Admin account is not verified.");

  return { ok: true, data: { adminId } };
}

export async function listUserKycRequests(userId: string): Promise<AdminServiceResult<KycRequestRecord[]>> {
  const { data, error } = await supabase
    .from("kyc_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return toError("LOAD_KYC_FAILED", error.message);
  return { ok: true, data: (data ?? []) as KycRequestRecord[] };
}

export async function submitKycDocument(
  userId: string,
  documentType: KycDocumentType,
  file: File,
): Promise<AdminServiceResult<KycRequestRecord>> {
  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `kyc/${userId}/${documentType}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage.from("kyc-documents").upload(storagePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (uploadError) return toError("UPLOAD_FAILED", uploadError.message);

    const payload = {
      user_id: userId,
      document_type: documentType,
      status: "pending",
      rejection_reason: null,
      reviewed_by: null,
      reviewed_at: null,
      created_at: new Date().toISOString(),
    } as Record<string, unknown>;

    payload[getStorageField(documentType)] = storagePath;

    const { data, error } = await supabase
      .from("kyc_requests")
      .upsert(
        {
          ...payload,
        },
        { onConflict: "user_id,document_type" },
      )
      .select()
      .maybeSingle();

    if (error) return toError("KYC_SAVE_FAILED", error.message);
    if (!data) return toError("KYC_SAVE_FAILED", "Your KYC request could not be saved.");

    return { ok: true, data: data as KycRequestRecord };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "KYC_SAVE_FAILED",
        message: error instanceof Error ? error.message : "Unable to upload KYC documents.",
      },
    };
  }
}

export async function getKycPreviewUrl(storagePath: string | null): Promise<string | null> {
  if (!storagePath) return null;
  const { data, error } = await supabase.storage.from("kyc-documents").createSignedUrl(storagePath, 60 * 60 * 24);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function listPendingKycRequests(): Promise<AdminServiceResult<KycRequestWithProfile[]>> {
  const { data, error } = await supabase
    .from("kyc_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return toError("LOAD_KYC_FAILED", error.message);

  const rows = (data ?? []) as KycRequestRecord[];
  const userIds = Array.from(new Set(rows.map((item) => item.user_id)));

  let profileMap = new Map<string, { id: string; email: string | null; full_name: string | null; username: string | null }>();
  if (userIds.length) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id,email,full_name,username")
      .in("id", userIds);

    if (!profileError) {
      for (const profile of profileData ?? []) {
        profileMap.set(profile.id, profile as { id: string; email: string | null; full_name: string | null; username: string | null });
      }
    }
  }

  return {
    ok: true,
    data: rows.map((item) => ({
      ...item,
      profile: profileMap.get(item.user_id) ?? null,
    })),
  };
}

export async function approveKycRequest(requestId: string): Promise<AdminServiceResult<void>> {
  const adminRes = await requireAdmin();
  if (!adminRes.ok) return adminRes;

  const { data: request, error: requestError } = await supabase
    .from("kyc_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();

  if (requestError || !request) return toError("NOT_FOUND", "KYC request not found.");

  const { error } = await supabase
    .from("kyc_requests")
    .update({
      status: "verified",
      rejection_reason: null,
      reviewed_by: adminRes.data.adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) return toError("APPROVE_KYC_FAILED", error.message);

  const profileUpdate = await supabase.from("profiles").update({ verification_status: "verified" }).eq("id", request.user_id);
  if (profileUpdate.error) return toError("PROFILE_UPDATE_FAILED", profileUpdate.error.message);

  await logAdminAction(adminRes.data.adminId, "approve_kyc", "kyc_requests", requestId, {
    user_id: request.user_id,
    document_type: request.document_type,
  });
  await createNotification(
    request.user_id,
    "KYC approved",
    "Your KYC documents have been approved by admin.",
    "KYC Approved",
    { request_id: requestId },
  );
  await sendKycApprovedEmail(request.user_id);

  return { ok: true, data: undefined };
}

export async function rejectKycRequest(requestId: string, reason: string): Promise<AdminServiceResult<void>> {
  const adminRes = await requireAdmin();
  if (!adminRes.ok) return adminRes;

  const trimmedReason = reason.trim();
  if (!trimmedReason) return toError("REJECTION_REASON_REQUIRED", "A rejection reason is required.");

  const { data: request, error: requestError } = await supabase
    .from("kyc_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();

  if (requestError || !request) return toError("NOT_FOUND", "KYC request not found.");

  const { error } = await supabase
    .from("kyc_requests")
    .update({
      status: "rejected",
      rejection_reason: trimmedReason,
      reviewed_by: adminRes.data.adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) return toError("REJECT_KYC_FAILED", error.message);

  const profileUpdate = await supabase.from("profiles").update({ verification_status: "rejected" }).eq("id", request.user_id);
  if (profileUpdate.error) return toError("PROFILE_UPDATE_FAILED", profileUpdate.error.message);

  await logAdminAction(adminRes.data.adminId, "reject_kyc", "kyc_requests", requestId, {
    user_id: request.user_id,
    document_type: request.document_type,
    rejection_reason: trimmedReason,
  });
  await createNotification(
    request.user_id,
    "KYC rejected",
    `Your KYC documents were rejected. Reason: ${trimmedReason}`,
    "KYC Rejected",
    { request_id: requestId, reason: trimmedReason },
  );
  await sendKycRejectedEmail(request.user_id);

  return { ok: true, data: undefined };
}

export { getDisplayLabel };
