import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AppreciationBoard from '../components/recognition/AppreciationBoard';
import AwardForm from '../components/recognition/AwardForm';
import ReferenceForms from '../components/recognition/ReferenceForms';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Tooltip from '../components/common/Tooltip';
import { useRecognitionsQuery } from '../queries/useRecognitionsQuery';
import Icon from '../components/common/Icon';

export default function RecognitionPage({ data, onChanged }) {
    const [awardOpen, setAwardOpen] = useState(false);
    const [referencesOpen, setReferencesOpen] = useState(false);
    const [recognitionPage, setRecognitionPage] = useState(1);
    const queryClient = useQueryClient();
    const recognitions = useRecognitionsQuery(recognitionPage);

    const handleAwarded = async () => {
        setAwardOpen(false);
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['recognitions'] }),
            onChanged('Recognition awarded successfully.', true),
        ]);
    };

    const handleRevoked = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['recognitions'] }),
            onChanged('Recognition revoked and points reversed.', true),
        ]);
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
                <article className="border-cod-gray bg-cod-gray flex items-center gap-4 rounded-2xl border p-6">
                    <div className="border-pomegranate bg-cod-gray text-cararra flex size-12 shrink-0 items-center justify-center rounded-xl border-2 text-xl font-black">
                        <Icon name="sparkle" className="size-6 text-pomegranate" />
                    </div>
                    <div className="grid gap-1">
                        <span className="text-cararra/80">
                            Your available balance
                        </span>
                        <strong className="text-cararra text-4xl leading-none font-semibold tracking-[-.04em]">
                            {data.wallet?.balance ?? 0} points
                        </strong>
                        <p className="text-cararra/75 text-sm">
                            Earned through meaningful recognition from your
                            team.
                        </p>
                    </div>
                </article>
                <article className="border-cod-gray/20 bg-cararra flex items-center gap-4 rounded-2xl border p-6 shadow-sm">
                    <div className="border-cod-gray/40 bg-cod-gray/5 text-cod-gray flex size-12 shrink-0 items-center justify-center rounded-xl border text-xl font-black">
                        <Icon name="gift" className="size-6 text-cod-gray" />
                    </div>
                    <div className="grid gap-1">
                        <div className="flex items-center gap-1.5">
                            <span className="text-cod-gray/75 text-sm">
                                Conversion rate
                            </span>
                            <Tooltip text="Fixed exchange rate used when converting awards between Singapore Dollars and reward points.">
                                <span tabIndex="0" className="inline-grid size-5 cursor-help place-items-center rounded-full border border-cod-gray/30 text-cod-gray hover:border-pomegranate hover:text-pomegranate" aria-label="SGD conversion rate info">
                                    <Icon name="info" className="size-3" />
                                </span>
                            </Tooltip>
                        </div>
                        <strong className="text-cod-gray text-2xl font-bold leading-tight">
                            SGD 1 = {data.points_per_sgd} pts
                        </strong>
                        <p className="text-cod-gray/75 text-sm">
                            Calculated consistently by the API.
                        </p>
                    </div>
                </article>
            </section>
            <div className="mb-6 flex flex-wrap gap-3">
                {data.permissions.award && (
                    <Button
                        size="lg"
                        onClick={() => setAwardOpen(true)}
                    >
                        <Icon name="plus" />
                        Give recognition
                    </Button>
                )}
                {data.permissions.manage && (
                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={() => setReferencesOpen(true)}
                    >
                        <Icon name="settings" />
                        Manage reference data
                    </Button>
                )}
            </div>
            <div>
                <AppreciationBoard
                    recognitions={recognitions.data?.data ?? []}
                    meta={recognitions.data?.meta}
                    loading={recognitions.isPending}
                    fetching={recognitions.isFetching}
                    onPageChange={setRecognitionPage}
                    canRevoke={data.permissions.manage}
                    onRevoked={handleRevoked}
                />
            </div>
            <Modal
                open={awardOpen}
                title="Employee Administration: Give Recognition"
                onClose={() => setAwardOpen(false)}
            >
                <AwardForm
                    data={data}
                    onAwarded={handleAwarded}
                />
            </Modal>
            <Modal
                open={referencesOpen}
                title="Employee Administration: Manage Reference Data"
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
