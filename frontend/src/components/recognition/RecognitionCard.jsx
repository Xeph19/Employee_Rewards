import { useState } from 'react';
import Button from '../common/Button';

export default function RecognitionCard({ recognition, canRevoke, onRevoke }) {
    const [reason, setReason] = useState('');

    return (
        <article className="border-cod-gray/20 bg-cararra hover:border-pomegranate rounded-2xl border p-5 shadow-sm transition hover:-translate-y-px">
            <div className="flex justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="bg-cod-gray text-cararra grid size-8 place-items-center rounded-full text-xs font-extrabold">
                        {recognition.recipient.name.slice(0, 1)}
                    </span>
                    <div className="grid">
                        <strong className="text-cod-gray">
                            {recognition.recipient.name}
                        </strong>
                        <small className="text-cod-gray/70">
                            recognized by {recognition.awarder.name}
                        </small>
                    </div>
                </div>
                <span className="bg-cod-gray text-cararra h-fit rounded-full px-3 py-1.5 text-sm font-semibold">
                    +{recognition.points} pts
                </span>
            </div>
            <p className="text-cod-gray my-4 text-base leading-7">
                &ldquo;{recognition.message}&rdquo;
            </p>
            <div className="flex flex-wrap items-center gap-2">
                {recognition.occasion && (
                    <span className="border-cod-gray/20 text-cod-gray rounded-full border px-3 py-1 text-xs font-medium">
                        {recognition.occasion.name}
                    </span>
                )}
                {recognition.company_values.map((value) => (
                    <span
                        className="border-cod-gray/20 text-cod-gray rounded-full border px-3 py-1 text-xs font-medium"
                        key={value.id}
                    >
                        {value.name}
                    </span>
                ))}
                <time className="text-cod-gray/65 ml-auto text-xs">
                    {new Date(recognition.created_at).toLocaleDateString()}
                </time>
            </div>
            {canRevoke && (
                <div className="mt-4 flex gap-2 max-sm:flex-col">
                    <input
                        className="flex-1"
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Reason for revocation"
                    />
                    <Button
                        type="button"
                        variant="danger"
                        disabled={!reason.trim()}
                        onClick={() => {
                            if (reason.trim()) {
                                onRevoke(recognition, reason.trim());
                            }
                        }}
                    >
                        Revoke
                    </Button>
                </div>
            )}
        </article>
    );
}
