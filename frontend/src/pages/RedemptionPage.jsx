import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError, apiClient } from '../api/client';
import { apiRoutes } from '../api/routes';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Icon from '../components/common/Icon';
import CatalogueFilters from '../components/redemption/CatalogueFilters';
import RedemptionHistory from '../components/redemption/RedemptionHistory';
import RewardCard from '../components/redemption/RewardCard';
import AddRewardForm from '../components/redemption/AddRewardForm';
import { useCatalogueQuery } from '../queries/useCatalogueQuery';
import { useRedemptionsQuery } from '../queries/useRedemptionsQuery';

export default function RedemptionPage({ balance, canManage = false, onRedeemed }) {
    const queryClient = useQueryClient();
    const [searchInput, setSearchInput] = useState('');
    const [filters, setFilters] = useState({ search: '', category: '', page: 1 });
    const [selectedReward, setSelectedReward] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [addRewardOpen, setAddRewardOpen] = useState(false);
    const [error, setError] = useState('');
    const catalogue = useCatalogueQuery(filters);
    const history = useRedemptionsQuery(1);
    const redeem = useMutation({
        mutationFn: (reward) =>
            apiClient.post(apiRoutes.redemptions, {
                reward_id: reward.id,
                request_key: crypto.randomUUID(),
            }),
    });

    useEffect(() => {
        const timer = window.setTimeout(
            () => setFilters((current) => ({ ...current, search: searchInput, page: 1 })),
            300,
        );
        return () => window.clearTimeout(timer);
    }, [searchInput]);

    const confirmRedemption = async () => {
        setError('');
        try {
            const response = await redeem.mutateAsync(selectedReward);
            setSelectedReward(null);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['catalogue'] }),
                queryClient.invalidateQueries({ queryKey: ['redemptions'] }),
                onRedeemed(`Reward redeemed. Reference: ${response.data.reference}`),
            ]);
        } catch (requestError) {
            setError(
                requestError instanceof ApiError
                    ? Object.values(requestError.errors).flat()[0]
                    : requestError.message,
            );
        }
    };

    const data = catalogue.data;
    const previousDisabled = (data?.meta.current_page ?? 1) <= 1;
    const nextDisabled = (data?.meta.current_page ?? 1) >= (data?.meta.last_page ?? 1);

    return (
        <>
            <header className="flex items-end justify-between gap-6 max-sm:flex-col max-sm:items-stretch">
                <div className="grid gap-1">
                    <span className="text-xs font-extrabold tracking-[.14em] uppercase">Rewards catalogue</span>
                    <h1 className="text-3xl font-semibold tracking-tight">Turn appreciation into something memorable.</h1>
                    <p className="text-cod-gray/75">Browse fictional Singapore merchants and redeem securely with points.</p>
                </div>
                <div className="rounded-2xl border border-cod-gray bg-cod-gray px-5 py-4 text-right text-cararra max-sm:text-left">
                    <small className="block text-cararra/70">Available balance</small>
                    <strong className="text-2xl">{balance.toLocaleString()} pts</strong>
                </div>
            </header>

            <div className="mt-6 grid gap-5">
                <CatalogueFilters
                    search={searchInput}
                    category={filters.category}
                    categories={data?.meta.categories ?? []}
                    onSearch={setSearchInput}
                    onCategory={(category) =>
                        setFilters((current) => ({ ...current, category, page: 1 }))
                    }
                />
                <div className="flex flex-wrap items-center justify-end gap-3">
                    {canManage && (
                        <Button
                            variant="primary"
                            onClick={() => setAddRewardOpen(true)}
                        >
                            <Icon name="plus" /> Add Reward
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        aria-pressed={showHistory}
                        onClick={() => setShowHistory((current) => !current)}
                    >
                        <Icon name={showHistory ? 'gift' : 'history'} />
                        {showHistory ? 'Browse catalogue' : 'View redemption history'}
                    </Button>
                </div>

                {showHistory ? (
                    <RedemptionHistory redemptions={history.data?.data ?? []} loading={history.isPending} />
                ) : (
                    <>
                        {catalogue.isPending ? (
                            <div className="rounded-2xl border border-cod-gray/15 p-10 text-center font-semibold">Loading rewards...</div>
                        ) : data?.data.length ? (
                            <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
                                {data.data.map((reward) => (
                                    <RewardCard key={reward.id} reward={reward} balance={balance} onRedeem={setSelectedReward} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-cod-gray/30 p-10 text-center">
                                <h2 className="font-bold">No rewards found</h2>
                                <p className="text-sm text-cod-gray/70">Try a different search or category.</p>
                            </div>
                        )}
                        <nav className="flex items-center justify-center gap-3" aria-label="Catalogue pagination">
                            <Button variant="secondary" disabled={previousDisabled} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}><Icon name="left" />Previous</Button>
                            <span className="min-w-24 text-center text-sm font-semibold">Page {data?.meta.current_page ?? 1} of {data?.meta.last_page ?? 1}</span>
                            <Button variant="secondary" disabled={nextDisabled} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}>Next<Icon name="right" /></Button>
                        </nav>
                    </>
                )}
            </div>

            <Modal open={Boolean(selectedReward)} title="Employee Administration: Confirm Redemption" onClose={() => setSelectedReward(null)}>
                {selectedReward && (
                    <div className="grid gap-6">
                        <div className="rounded-2xl border border-cod-gray/20 bg-cod-gray/5 p-4">
                            <p className="text-sm text-cod-gray/70">You are redeeming</p>
                            <h3 className="text-xl font-bold">{selectedReward.name}</h3>
                            <p className="text-sm">{selectedReward.merchant.name}</p>
                            <strong className="mt-3 block text-2xl">{selectedReward.points_cost.toLocaleString()} points</strong>
                        </div>
                        {error && <p className="rounded-xl border-l-4 border-pomegranate bg-pomegranate/10 px-4 py-3 font-semibold">{error}</p>}
                        <div className="flex justify-end gap-3 max-sm:flex-col-reverse">
                            <Button variant="secondary" className="max-sm:w-full" onClick={() => setSelectedReward(null)}>Cancel</Button>
                            <Button loading={redeem.isPending} className="max-sm:w-full" onClick={confirmRedemption}><Icon name="gift" />{redeem.isPending ? 'Redeeming...' : 'Confirm redemption'}</Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                open={addRewardOpen}
                title="Employee Administration: Add Reward"
                onClose={() => setAddRewardOpen(false)}
            >
                <AddRewardForm
                    onCreated={async () => {
                        setAddRewardOpen(false);
                        await queryClient.invalidateQueries({ queryKey: ['catalogue'] });
                    }}
                    onCancel={() => setAddRewardOpen(false)}
                />
            </Modal>
        </>
    );
}
