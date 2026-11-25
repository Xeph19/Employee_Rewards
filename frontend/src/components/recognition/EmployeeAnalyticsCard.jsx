import { useState } from 'react';
import Icon from '../common/Icon';
import Tooltip from '../common/Tooltip';
import { useEmployeeAnalyticsQuery } from '../../queries/useAnalyticsQuery';
import { apiRoutes } from '../../api/routes';

export default function EmployeeAnalyticsCard() {
    const analyticsQuery = useEmployeeAnalyticsQuery();
    const stats = analyticsQuery.data;
    const [selectedFormat, setSelectedFormat] = useState('csv');
    const [activeTab, setActiveTab] = useState('collection'); // 'collection' | 'ledger'
    const redeemedRewards = stats?.redeemed_rewards ?? [];

    return (
        <section className="mt-8 rounded-2xl border border-cod-gray/20 bg-cararra p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <span className="text-xs font-extrabold tracking-[.14em] uppercase text-cod-gray">
                        Personal Activity & Collection
                    </span>
                    <h2 className="text-xl font-bold text-cod-gray">
                        Employee Rewards & Recognition Account
                    </h2>
                    <p className="text-xs text-cod-gray/70">
                        Overview of points accumulated, redeemed rewards vault, and audit statements.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={selectedFormat}
                        onChange={(e) => setSelectedFormat(e.target.value)}
                        className="rounded-xl border border-cod-gray/35 bg-white px-3 py-2 text-xs font-bold text-cod-gray focus:outline-none"
                    >
                        <option value="csv">CSV (.csv)</option>
                        <option value="xlsx">Excel (.xlsx)</option>
                        <option value="tsv">TSV (.tsv)</option>
                        <option value="xml">XML (.xml)</option>
                    </select>
                    <a
                        href={`${apiRoutes.analyticsPersonalExport}?format=${selectedFormat}`}
                        download
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-cod-gray/35 bg-cararra px-4 py-2 text-sm font-bold text-cod-gray shadow-sm transition hover:border-pomegranate hover:bg-cod-gray/5"
                    >
                        <Icon name="download" /> Export Statement
                    </a>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
                <div className="rounded-xl border border-cod-gray/15 bg-white p-4">
                    <span className="text-xs font-medium text-cod-gray/70">Points Earned</span>
                    <strong className="mt-1 block text-2xl font-bold text-cod-gray">
                        +{stats?.points_earned?.toLocaleString() ?? 0}
                    </strong>
                </div>
                <div className="rounded-xl border border-cod-gray/15 bg-white p-4">
                    <span className="text-xs font-medium text-cod-gray/70">Points Redeemed</span>
                    <strong className="mt-1 block text-2xl font-bold text-pomegranate">
                        -{stats?.points_spent?.toLocaleString() ?? 0}
                    </strong>
                </div>
                <div className="rounded-xl border border-cod-gray/15 bg-white p-4">
                    <span className="text-xs font-medium text-cod-gray/70">Recognitions Received</span>
                    <strong className="mt-1 block text-2xl font-bold text-cod-gray">
                        {stats?.recognitions_received ?? 0}
                    </strong>
                </div>
                <div className="rounded-xl border border-cod-gray/15 bg-white p-4">
                    <span className="text-xs font-medium text-cod-gray/70">Redeemed Rewards</span>
                    <strong className="mt-1 block text-2xl font-bold text-cod-gray">
                        {redeemedRewards.length}
                    </strong>
                </div>
            </div>

            {/* Navigation Tabs for Collection vs Ledger */}
            <div className="mt-8 flex items-center gap-2 border-b border-cod-gray/15 pb-2">
                <button
                    type="button"
                    onClick={() => setActiveTab('collection')}
                    className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                        activeTab === 'collection'
                            ? 'bg-cod-gray text-cararra shadow-sm'
                            : 'text-cod-gray/70 hover:bg-cod-gray/5 hover:text-cod-gray'
                    }`}
                >
                    <Icon name="gift" /> My Redeemed Rewards Collection ({redeemedRewards.length})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('ledger')}
                    className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                        activeTab === 'ledger'
                            ? 'bg-cod-gray text-cararra shadow-sm'
                            : 'text-cod-gray/70 hover:bg-cod-gray/5 hover:text-cod-gray'
                    }`}
                >
                    <Icon name="chart" /> Ledger Transactions ({stats?.recent_ledger?.length ?? 0})
                </button>
            </div>

            {/* Collection Tab */}
            {activeTab === 'collection' && (
                <div className="mt-6">
                    {redeemedRewards.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-cod-gray/25 p-8 text-center bg-white/50">
                            <Icon name="gift" className="mx-auto size-8 text-cod-gray/40 mb-2" />
                            <h3 className="text-sm font-bold text-cod-gray">No rewards redeemed yet</h3>
                            <p className="mt-1 text-xs text-cod-gray/70">
                                Use your earned reward points in the Redeem section to claim shopping, dining, and wellness vouchers.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-2 max-sm:grid-cols-1">
                            {redeemedRewards.map((item) => (
                                <div
                                    key={item.id}
                                    className="relative flex flex-col justify-between rounded-xl border border-cod-gray/20 bg-white p-4 shadow-sm transition hover:border-cod-gray/40 hover:shadow-md"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="rounded-md border border-cod-gray/20 bg-cararra px-2 py-0.5 text-[10px] font-bold text-cod-gray uppercase tracking-wider">
                                                {item.reward?.merchant?.category ?? item.reward?.category ?? 'Voucher'}
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                                                <span className="size-1.5 rounded-full bg-green-600" /> Redeemed
                                            </span>
                                        </div>
                                        <h4 className="mt-2 text-sm font-bold text-cod-gray line-clamp-1">
                                            {item.reward?.name ?? 'Merchant Reward'}
                                        </h4>
                                        <p className="text-xs font-medium text-cod-gray/65">
                                            {item.reward?.merchant?.name ?? 'Singapore Merchant'}
                                        </p>
                                    </div>

                                    <div className="mt-4 border-t border-cod-gray/10 pt-3">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-cod-gray/60">Points spent</span>
                                            <span className="font-bold text-pomegranate">
                                                -{item.points_spent.toLocaleString()} pts
                                            </span>
                                        </div>
                                        <div className="mt-2 rounded-lg border border-cod-gray/15 bg-cod-gray/5 p-2 font-mono text-[11px] text-cod-gray flex items-center justify-between">
                                            <span className="truncate tracking-wider font-semibold">
                                                {item.reference}
                                            </span>
                                            <Tooltip text="Redemption reference code to present at merchant.">
                                                <span tabIndex="0" className="ml-1 inline-block cursor-help opacity-60 hover:opacity-100">
                                                    <Icon name="info" className="size-3" />
                                                </span>
                                            </Tooltip>
                                        </div>
                                        <div className="mt-2 text-[10px] text-cod-gray/50 text-right">
                                            Redeemed on {new Date(item.created_at).toLocaleDateString('en-SG')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Ledger Transactions Tab */}
            {activeTab === 'ledger' && (
                <div className="mt-6">
                    <h3 className="mb-2 text-sm font-bold text-cod-gray">Recent Transactions</h3>
                    <div className="overflow-x-auto rounded-xl border border-cod-gray/15 bg-white">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead>
                                <tr className="bg-cod-gray/5 text-cod-gray font-semibold">
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Description</th>
                                    <th className="p-3">Amount</th>
                                    <th className="p-3">Balance After</th>
                                    <th className="p-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.recent_ledger?.length > 0 ? (
                                    stats.recent_ledger.map((entry) => (
                                        <tr key={entry.id} className="border-t border-cod-gray/10">
                                            <td className="p-3 font-semibold uppercase">{entry.entry_type ?? entry.type}</td>
                                            <td className="p-3 text-cod-gray/80">{entry.description || '-'}</td>
                                            <td className={`p-3 font-bold ${entry.amount > 0 ? 'text-green-700' : 'text-pomegranate'}`}>
                                                {entry.amount > 0 ? `+${entry.amount}` : entry.amount} pts
                                            </td>
                                            <td className="p-3 font-medium">{entry.balance_after} pts</td>
                                            <td className="p-3 text-cod-gray/65">
                                                {new Date(entry.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-4 text-center text-cod-gray/60">
                                            No transaction entries found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </section>
    );
}
