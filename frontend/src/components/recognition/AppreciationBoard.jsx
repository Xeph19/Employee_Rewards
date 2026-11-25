import { useState } from 'react';
import { apiClient } from '../../api/client';
import { apiRoutes } from '../../api/routes';
import RecognitionCard from './RecognitionCard';
import Button from '../common/Button';
import ConfirmDialog from '../common/ConfirmDialog';

export default function AppreciationBoard({
    recognitions,
    meta,
    loading,
    fetching,
    onPageChange,
    canRevoke,
    onRevoked,
}) {
    const [revokingTarget, setRevokingTarget] = useState(null);
    const [revoking, setRevoking] = useState(false);

    const handleRevokeRequest = (recognition, reason) => {
        setRevokingTarget({ recognition, reason });
    };

    const confirmRevoke = async () => {
        if (!revokingTarget) return;
        setRevoking(true);
        try {
            await apiClient.post(
                apiRoutes.recognitionRevocations(revokingTarget.recognition.id),
                {
                    reason: revokingTarget.reason,
                },
            );
            await onRevoked();
            setRevokingTarget(null);
        } finally {
            setRevoking(false);
        }
    };

    return (
        <section>
            <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                    <span className="text-cod-gray text-xs font-extrabold tracking-[.14em] uppercase">
                        Company pulse
                    </span>
                    <h1 className="text-cod-gray text-2xl font-semibold">
                        Appreciation board
                    </h1>
                    <p className="text-cod-gray/75 text-sm">
                        The latest moments of impact across the company.
                    </p>
                </div>
                <span className="border-cod-gray/20 bg-cararra text-cod-gray rounded-full border px-3 py-1.5 text-xs font-semibold max-sm:hidden">
                    {meta?.total ?? recognitions.length} moments
                </span>
            </div>
            <div className="grid gap-4">
                {loading && (
                    <div className="grid gap-3" role="status" aria-label="Loading recognitions">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="h-40 animate-pulse rounded-2xl border border-cod-gray/10 bg-cod-gray/5" />
                        ))}
                    </div>
                )}
                {recognitions.map((recognition) => (
                    <RecognitionCard
                        key={recognition.id}
                        recognition={recognition}
                        canRevoke={canRevoke}
                        onRevoke={handleRevokeRequest}
                    />
                ))}
                {!loading && recognitions.length === 0 && (
                    <div className="border-cod-gray/30 text-cod-gray/75 rounded-2xl border border-dashed p-12 text-center">
                        No recognitions yet. Be the first to celebrate great
                        work.
                    </div>
                )}
            </div>
            {(meta?.last_page ?? 1) > 1 && (
                <nav className="mt-5 flex items-center justify-center gap-3" aria-label="Recognition pagination">
                    <Button variant="secondary" disabled={meta.current_page <= 1 || fetching} onClick={() => onPageChange(meta.current_page - 1)}>Previous</Button>
                    <span className="min-w-24 text-center text-sm font-semibold">Page {meta.current_page} of {meta.last_page}</span>
                    <Button variant="secondary" disabled={meta.current_page >= meta.last_page || fetching} onClick={() => onPageChange(meta.current_page + 1)}>Next</Button>
                </nav>
            )}

            <ConfirmDialog
                open={Boolean(revokingTarget)}
                title="Employee Administration: Revoke Recognition"
                description={`Are you sure you want to revoke this recognition awarded to ${revokingTarget?.recognition.recipient.name}? Points awarded will be reversed and this moment will be archived.`}
                confirmLabel="Revoke recognition"
                destructive
                loading={revoking}
                onCancel={() => setRevokingTarget(null)}
                onConfirm={confirmRevoke}
            />
        </section>
    );
}
