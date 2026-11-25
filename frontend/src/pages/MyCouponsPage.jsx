import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { apiRoutes } from '../api/routes';
import Icon from '../components/common/Icon';
import Tooltip from '../components/common/Tooltip';
import Button from '../components/common/Button';
import EmployeeAnalyticsCard from '../components/recognition/EmployeeAnalyticsCard';

export default function MyCouponsPage({ onNavigateRedeem }) {
    const [page, setPage] = useState(1);
    const redemptionsQuery = useQuery({
        queryKey: ['redemptions', page],
        queryFn: () => apiClient.get(`${apiRoutes.redemptions}?page=${page}`),
    });

    const items = redemptionsQuery.data?.data ?? [];
    const meta = redemptionsQuery.data?.meta ?? {
        current_page: 1,
        last_page: 1,
        total: 0,
    };

    return (
        <div className="space-y-8">
            <header className="flex items-end justify-between gap-6 max-sm:flex-col max-sm:items-start">
                <div>
                    <span className="text-xs font-extrabold tracking-[.14em] uppercase text-cod-gray">
                        Personal Account & Rewards
                    </span>
                    <h1 className="mt-1 text-3xl font-semibold text-cod-gray">
                        My Rewards & Account Activity
                    </h1>
                    <p className="text-cod-gray/75 text-sm">
                        View accumulated points, download statements, and access all your redeemed merchant coupons and claim codes.
                    </p>
                </div>
                <Button variant="secondary" onClick={onNavigateRedeem}>
                    <Icon name="gift" /> Browse Rewards Catalogue
                </Button>
            </header>

            {/* Combined Employee Rewards & Recognition Account section */}
            <EmployeeAnalyticsCard />

            {/* Detailed Voucher / Coupon Vault Section */}
            <section className="rounded-2xl border border-cod-gray/20 bg-cararra p-6 shadow-sm">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <span className="text-xs font-extrabold tracking-[.14em] uppercase text-cod-gray">
                            Claim Vault
                        </span>
                        <h2 className="text-xl font-bold text-cod-gray">
                            Redeemed Vouchers & Claim Codes
                        </h2>
                        <p className="text-xs text-cod-gray/70">
                            Present these reference codes to merchant cashiers or online checkout.
                        </p>
                    </div>
                    <span className="rounded-full border border-cod-gray/20 bg-white px-3 py-1 text-xs font-semibold text-cod-gray">
                        {meta.total} active vouchers
                    </span>
                </div>

                {redemptionsQuery.isPending ? (
                    <div className="rounded-2xl border border-cod-gray/20 bg-white p-10 text-center font-semibold text-cod-gray/70">
                        Loading your vouchers...
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-cod-gray/25 bg-white/70 p-10 text-center">
                        <div className="mx-auto grid size-12 place-items-center rounded-2xl border border-cod-gray/20 bg-cod-gray/5 text-cod-gray mb-3">
                            <Icon name="ticket" className="size-6" />
                        </div>
                        <h3 className="text-base font-bold text-cod-gray">No redeemed coupons yet</h3>
                        <p className="mt-1 text-xs text-cod-gray/70 max-w-md mx-auto">
                            Turn your recognition points into merchant rewards! Browse dining, groceries, lifestyle, and wellness gift cards.
                        </p>
                        <div className="mt-4">
                            <Button variant="primary" onClick={onNavigateRedeem}>
                                <Icon name="gift" /> Explore Rewards Catalogue
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="relative flex flex-col justify-between rounded-2xl border border-cod-gray/20 bg-white p-5 shadow-sm transition hover:border-cod-gray/40 hover:shadow-md"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="rounded-md border border-cod-gray/20 bg-cararra px-2.5 py-0.5 text-[10px] font-bold text-cod-gray uppercase tracking-wider">
                                                {item.reward?.merchant?.category ?? 'Singapore Merchant'}
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
                                                <span className="size-1.5 rounded-full bg-green-600" /> Active Voucher
                                            </span>
                                        </div>
                                        <h3 className="mt-3 text-base font-bold text-cod-gray leading-snug">
                                            {item.reward?.name ?? 'Merchant Reward'}
                                        </h3>
                                        <p className="text-xs font-semibold text-cod-gray/60">
                                            {item.reward?.merchant?.name ?? 'Partner Merchant'}
                                        </p>
                                    </div>

                                    <div className="mt-5 border-t border-cod-gray/10 pt-4">
                                        <div className="flex items-center justify-between text-xs mb-2">
                                            <span className="text-cod-gray/60">Points spent</span>
                                            <strong className="font-bold text-pomegranate">
                                                -{item.points_spent.toLocaleString()} pts
                                            </strong>
                                        </div>

                                        {/* Voucher Code Box */}
                                        <div className="rounded-xl border border-dashed border-cod-gray/30 bg-cod-gray/5 p-3">
                                            <span className="block text-[10px] font-bold uppercase tracking-wider text-cod-gray/60">
                                                Claim / Promo Code
                                            </span>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="font-mono text-xs font-bold tracking-wider text-cod-gray select-all">
                                                    {item.reference}
                                                </span>
                                                <Tooltip text="Present this redemption reference code at the store or cashier.">
                                                    <span tabIndex="0" className="cursor-help text-cod-gray/50 hover:text-cod-gray">
                                                        <Icon name="info" className="size-3.5" />
                                                    </span>
                                                </Tooltip>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between text-[11px] text-cod-gray/55">
                                            <span>Redeemed</span>
                                            <span>{new Date(item.created_at).toLocaleDateString('en-SG')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {meta.last_page > 1 && (
                            <div className="mt-6 flex items-center justify-between border-t border-cod-gray/15 pt-4 text-xs">
                                <span className="text-cod-gray/70">
                                    Page <strong className="text-cod-gray">{meta.current_page}</strong> of{' '}
                                    <strong className="text-cod-gray">{meta.last_page}</strong> ({meta.total} coupons)
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={meta.current_page <= 1}
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    >
                                        Previous
                                    </Button>
                                    <span className="px-2 font-bold text-cod-gray">{meta.current_page}</span>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={meta.current_page >= meta.last_page}
                                        onClick={() => setPage((p) => p + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}
