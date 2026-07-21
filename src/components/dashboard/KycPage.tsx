import React, { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Divider, LoadingSkeleton } from "../../design-system";
import { DashboardLayout } from "../layout/DashboardLayout";
import { getKycPreviewUrl, listUserKycRequests, submitKycDocument, type KycDocumentType, type KycRequestRecord } from "../../lib/kycService";
import { supabase } from "../../lib/supabase";

const DOCUMENT_TYPES: Array<{ key: KycDocumentType; label: string }> = [
  { key: "national_id", label: "National ID" },
  { key: "passport", label: "Passport" },
  { key: "driver_license", label: "Driver License" },
  { key: "selfie", label: "Selfie" },
  { key: "proof_of_address", label: "Proof of Address" },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "verified":
      return <Badge variant="success">Verified</Badge>;
    case "rejected":
      return <Badge variant="danger">Rejected</Badge>;
    default:
      return <Badge variant="warning">Pending</Badge>;
  }
}

function getDocumentLabel(documentType: KycDocumentType) {
  return DOCUMENT_TYPES.find((item) => item.key === documentType)?.label ?? documentType;
}

export function KycPage({ onLogout }: { onLogout?: () => void }) {
  const [requests, setRequests] = useState<KycRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<KycDocumentType>("national_id");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData.user?.id ?? null;
      if (!mounted) return;
      setUserId(currentUserId);
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      const result = await listUserKycRequests(currentUserId);
      if (!mounted) return;
      if (result.ok) {
        setRequests(result.data);
      }
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const loadPreviews = async () => {
      const urls: Record<string, string> = {};
      for (const request of requests) {
        const field = request.document_type === "selfie"
          ? request.selfie_url
          : request.document_type === "proof_of_address"
            ? request.address_url
            : request.document_url;
        if (field) {
          const previews = await getKycPreviewUrl(field);
          if (previews) {
            urls[request.id] = previews;
          }
        }
      }
      setPreviewUrls(urls);
    };

    void loadPreviews();
  }, [requests]);

  const latestRequest = useMemo(() => requests[0] ?? null, [requests]);

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId || !selectedFile) {
      setFeedback("Please choose a file to upload.");
      return;
    }

    setUploading(true);
    setFeedback(null);
    const result = await submitKycDocument(userId, selectedType, selectedFile);
    setUploading(false);
    if (result.ok) {
      setFeedback("Document uploaded successfully. You can replace it before admin review.");
      const refreshed = await listUserKycRequests(userId);
      if (refreshed.ok) {
        setRequests(refreshed.data);
      }
      setSelectedFile(null);
      const fileInput = document.getElementById("kyc-file-input") as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = "";
      }
    } else {
      setFeedback(result.error.message);
    }
  };

  return (
    <DashboardLayout initialActiveNav="account_settings" onLogout={onLogout}>
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E53E3E]">KYC Verification</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Secure identity checks</h1>
          <p className="mt-2 text-sm text-slate-600">Upload your verification documents. You can replace them before approval.</p>
        </div>

        <Card className="rounded-2xl p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-semibold text-slate-900">Current status</div>
              <div className="mt-1 text-sm text-slate-600">Your latest request is {latestRequest ? latestRequest.status : "not started"}.</div>
            </div>
            {latestRequest ? getStatusBadge(latestRequest.status) : <Badge variant="warning">Pending</Badge>}
          </div>

          <Divider className="my-5" />

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Document type</label>
              <select
                value={selectedType}
                onChange={(event) => setSelectedType(event.target.value as KycDocumentType)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
              >
                {DOCUMENT_TYPES.map((item) => (
                  <option value={item.key} key={item.key}>{item.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Upload file</label>
              <input
                id="kyc-file-input"
                type="file"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" loading={uploading}>Upload document</Button>
              {feedback ? <span className="text-sm text-slate-600">{feedback}</span> : null}
            </div>
          </form>
        </Card>

        <Card className="rounded-2xl p-6">
          <div className="text-lg font-semibold text-slate-900">Your uploaded documents</div>
          <p className="mt-1 text-sm text-slate-600">Preview and replace files before an admin approves them.</p>
          {loading ? (
            <div className="mt-4 space-y-3">
              <LoadingSkeleton variant="card" />
            </div>
          ) : requests.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">
              No documents uploaded yet.
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {requests.map((request) => {
                const previewUrl = previewUrls[request.id];
                const filePath = request.document_type === "selfie"
                  ? request.selfie_url
                  : request.document_type === "proof_of_address"
                    ? request.address_url
                    : request.document_url;

                return (
                  <div key={request.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">{getDocumentLabel(request.document_type)}</div>
                        <div className="mt-1 text-sm text-slate-600">Status: {request.status}</div>
                        {request.rejection_reason ? <div className="text-sm text-[#E53E3E]">Reason: {request.rejection_reason}</div> : null}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                    {filePath ? (
                      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
                        {previewUrl ? (
                          <a href={previewUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#E53E3E] underline">
                            Preview file
                          </a>
                        ) : null}
                        <span className="text-sm text-slate-500">Stored path: {filePath}</span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
