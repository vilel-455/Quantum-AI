import React, { useEffect, useState } from 'react';
import { Button, Card, LoadingSkeleton } from '../../../design-system';
import { AdminLayout } from '../AdminLayout';
import { approveKycRequest, listPendingKycRequests, rejectKycRequest, type KycRequestWithProfile } from '../../../lib/kycService';
import { getKycPreviewUrl } from '../../../lib/kycService';

export function KycAdminPage() {
  const [requests, setRequests] = useState<KycRequestWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reasonMap, setReasonMap] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  const refresh = async () => {
    setLoading(true);
    const result = await listPendingKycRequests();
    if (result.ok) {
      setRequests(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    const loadPreviews = async () => {
      const urls: Record<string, string> = {};
      for (const request of requests) {
        const filePath = request.document_type === 'selfie' ? request.selfie_url : request.document_type === 'proof_of_address' ? request.address_url : request.document_url;
        if (filePath) {
          const preview = await getKycPreviewUrl(filePath);
          if (preview) {
            urls[request.id] = preview;
          }
        }
      }
      setPreviewUrls(urls);
    };

    void loadPreviews();
  }, [requests]);

  const handleApprove = async (requestId: string) => {
    setBusyId(requestId);
    setFeedback(null);
    const result = await approveKycRequest(requestId);
    setBusyId(null);
    if (result.ok) {
      setFeedback('KYC request approved.');
      await refresh();
    } else {
      setFeedback(result.error.message);
    }
  };

  const handleReject = async (requestId: string) => {
    const reason = reasonMap[requestId]?.trim() ?? '';
    if (!reason) {
      setFeedback('A rejection reason is required.');
      return;
    }

    setBusyId(requestId);
    setFeedback(null);
    const result = await rejectKycRequest(requestId, reason);
    setBusyId(null);
    if (result.ok) {
      setFeedback('KYC request rejected.');
      await refresh();
    } else {
      setFeedback(result.error.message);
    }
  };

  return (
    <AdminLayout activeNav="admin_kyc_requests">
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E53E3E]">Admin KYC</p>
          <h1 className="mt-2 text-2xl font-semibold">Pending verification requests</h1>
          <p className="mt-2 text-sm text-white/70">Approve or reject documents and update profile verification state automatically.</p>
        </div>

        {feedback ? <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">{feedback}</div> : null}

        {loading ? (
          <div className="space-y-3">
            <LoadingSkeleton variant="card" />
          </div>
        ) : requests.length === 0 ? (
          <Card className="rounded-2xl border-white/10 bg-white/5 p-6">
            <div className="text-white/80">No pending KYC requests.</div>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const filePath = request.document_type === 'selfie' ? request.selfie_url : request.document_type === 'proof_of_address' ? request.address_url : request.document_url;
              return (
                <Card key={request.id} className="rounded-2xl border-white/10 bg-white/5 p-6">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="text-lg font-semibold text-white">{request.profile?.full_name ?? request.profile?.username ?? 'Unknown user'}</div>
                      <div className="mt-1 text-sm text-white/70">{request.profile?.email ?? 'No email available'}</div>
                      <div className="mt-2 text-sm text-white/70">Document type: {request.document_type}</div>
                    </div>
                    <div className="text-sm text-white/60">Requested {new Date(request.created_at).toLocaleString()}</div>
                  </div>

                  {filePath ? (
                    <div className="mt-4">
                      <a href={previewUrls[request.id] ?? '#'} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#E53E3E] underline">
                        Preview uploaded file
                      </a>
                    </div>
                  ) : null}

                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-semibold text-white/80">Rejection reason</label>
                    <textarea
                      rows={3}
                      value={reasonMap[request.id] ?? ''}
                      onChange={(event) => setReasonMap((prev) => ({ ...prev, [request.id]: event.target.value }))}
                      placeholder="Required when rejecting"
                      className="w-full rounded-xl border border-white/10 bg-[#081120] px-3 py-2 text-sm text-white outline-none"
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button loading={busyId === request.id} onClick={() => void handleApprove(request.id)}>Approve</Button>
                    <Button variant="outline" loading={busyId === request.id} onClick={() => void handleReject(request.id)}>Reject</Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
