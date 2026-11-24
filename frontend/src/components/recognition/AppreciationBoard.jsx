import { apiClient } from '../../api/client';
import { apiRoutes } from '../../api/routes';
import RecognitionCard from './RecognitionCard';

export default function AppreciationBoard({
    recognitions,
    canRevoke,
    onRevoked,
}) {
    const revoke = async (recognition, reason) => {
        await apiClient.post(apiRoutes.recognitionRevocations(recognition), {
            reason,
        });
        await onRevoked();
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
                    {recognitions.length} moments
                </span>
            </div>
            <div className="grid gap-4">
                {recognitions.map((recognition) => (
                    <RecognitionCard
                        key={recognition.id}
                        recognition={recognition}
                        canRevoke={canRevoke}
                        onRevoke={revoke}
                    />
                ))}
                {recognitions.length === 0 && (
                    <div className="border-cod-gray/30 text-cod-gray/75 rounded-2xl border border-dashed p-12 text-center">
                        No recognitions yet. Be the first to celebrate great
                        work.
                    </div>
                )}
            </div>
        </section>
    );
}
