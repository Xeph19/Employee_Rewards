import { useState } from 'react';
import AppreciationBoard from '../components/recognition/AppreciationBoard';
import AwardForm from '../components/recognition/AwardForm';
import ReferenceForms from '../components/recognition/ReferenceForms';
import Modal from '../components/common/Modal';

export default function RecognitionPage({ data, onChanged }) {
    const [awardOpen, setAwardOpen] = useState(false);
    const [referencesOpen, setReferencesOpen] = useState(false);

    const handleChanged = (message, close) => async () => {
        await onChanged(message);
        close(false);
    };

    return (
        <>
            <section className="my-2 mb-7 flex items-end justify-between gap-8 max-sm:flex-col max-sm:items-start">
                <div>
                    <span className="text-cod-gray text-xs font-extrabold tracking-[.14em] uppercase">
                        Recognition workspace
                    </span>
                    <h1 className="text-cod-gray my-2 text-4xl font-semibold tracking-[-.04em] max-sm:text-3xl">
                        Good to see you, {data.user.name.split(' ')[0]}.
                    </h1>
                    <p className="text-cod-gray/75">
                        Celebrate meaningful work and keep your team connected.
                    </p>
                </div>
                <span className="border-cod-gray bg-cod-gray text-cararra flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold whitespace-nowrap">
                    <i className="bg-pomegranate size-2 rounded-full" /> Live
                    appreciation feed
                </span>
            </section>
            <section className="mb-8 grid grid-cols-[2fr_1fr] gap-4 max-md:grid-cols-1">
                <article className="border-cod-gray bg-cod-gray flex items-start gap-4 rounded-2xl border p-6">
                    <div className="border-pomegranate bg-cod-gray text-cararra grid size-11 shrink-0 place-items-center rounded-xl border-2 text-xl font-black">
                        *
                    </div>
                    <div className="grid gap-2">
                        <span className="text-cararra/80">
                            Your available balance
                        </span>
                        <strong className="text-cararra text-4xl leading-none font-semibold tracking-[-.04em]">
                            {data.wallet?.balance ?? 0} points
                        </strong>
                        <p className="text-cararra/75">
                            Earned through meaningful recognition from your
                            team.
                        </p>
                    </div>
                </article>
                <article className="border-cod-gray/20 bg-cararra flex items-start gap-4 rounded-2xl border p-6 shadow-sm">
                    <div className="border-cod-gray bg-cararra text-cod-gray grid size-11 shrink-0 place-items-center rounded-xl border text-xl font-black">
                        +
                    </div>
                    <div className="grid gap-2">
                        <span className="text-cod-gray/75">
                            Conversion rate
                        </span>
                        <strong className="text-cod-gray text-xl">
                            SGD 1 = {data.points_per_sgd} pts
                        </strong>
                        <p className="text-cod-gray/75">
                            Calculated consistently by the API.
                        </p>
                    </div>
                </article>
            </section>
            <div className="mb-6 flex flex-wrap gap-3">
                {data.permissions.award && (
                    <button
                        className="bg-cod-gray text-cararra hover:outline-pomegranate rounded-xl px-5 py-3 font-bold transition hover:outline-2"
                        onClick={() => setAwardOpen(true)}
                    >
                        Give recognition
                    </button>
                )}
                {data.permissions.manage && (
                    <button
                        className="border-cod-gray text-cod-gray hover:border-pomegranate rounded-xl border-2 bg-transparent px-5 py-3 font-bold transition"
                        onClick={() => setReferencesOpen(true)}
                    >
                        Manage reference data
                    </button>
                )}
            </div>
            <div>
                <AppreciationBoard
                    recognitions={data.recognitions}
                    canRevoke={data.permissions.manage}
                    onRevoked={() =>
                        onChanged('Recognition revoked and points reversed.')
                    }
                />
            </div>
            <Modal
                open={awardOpen}
                title="Give recognition"
                onClose={() => setAwardOpen(false)}
            >
                <AwardForm
                    data={data}
                    onAwarded={handleChanged(
                        'Recognition awarded successfully.',
                        setAwardOpen,
                    )}
                />
            </Modal>
            <Modal
                open={referencesOpen}
                title="Manage reference data"
                onClose={() => setReferencesOpen(false)}
            >
                <ReferenceForms
                    values={data.company_values}
                    occasions={data.occasions}
                    onChanged={onChanged}
                />
            </Modal>
        </>
    );
}
