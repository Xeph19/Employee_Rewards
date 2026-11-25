import { useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, PolarArea } from 'react-chartjs-2';
import Icon from '../components/common/Icon';
import { useAdminSummaryQuery } from '../queries/useAnalyticsQuery';
import { apiRoutes } from '../api/routes';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler,
);

export default function AdminAnalyticsPage() {
    // 3 Common Filters that apply across all 4 charts
    const [department, setDepartment] = useState('');
    const [timeframe, setTimeframe] = useState('14');
    const [occasionId, setOccasionId] = useState('');
    const [exportFormat, setExportFormat] = useState('csv');
    const [balancePage, setBalancePage] = useState(1);

    const summaryQuery = useAdminSummaryQuery({
        department,
        timeframe,
        occasion_id: occasionId,
        balance_page: balancePage,
        balance_per_page: 10,
    });
    const data = summaryQuery.data;

    // Chart 1: Line Chart (Velocity)
    const velocityData = {
        labels: data?.charts?.velocity?.labels ?? [],
        datasets: [
            {
                label: 'Recognitions Awarded',
                data: data?.charts?.velocity?.recognitions ?? [],
                borderColor: '#111111',
                backgroundColor: 'rgba(17, 17, 17, 0.08)',
                fill: true,
                tension: 0.35,
            },
            {
                label: 'Redemptions Claimed',
                data: data?.charts?.velocity?.redemptions ?? [],
                borderColor: '#f11f18',
                backgroundColor: 'rgba(241, 31, 24, 0.08)',
                fill: true,
                tension: 0.35,
            },
        ],
    };

    // Chart 2: Bar Chart (Department Points Distribution)
    const departmentData = {
        labels: data?.charts?.departments?.labels ?? [],
        datasets: [
            {
                label: 'Points Distributed',
                data: data?.charts?.departments?.data ?? [],
                backgroundColor: [
                    '#111111',
                    '#f11f18',
                    '#4b5563',
                    '#d97706',
                    '#2563eb',
                    '#059669',
                ],
                borderRadius: 8,
            },
        ],
    };

    // Chart 3: Doughnut Chart (Recognitions by Occasion)
    const occasionData = {
        labels: data?.charts?.occasions?.labels ?? [],
        datasets: [
            {
                label: 'Occasion Volume',
                data: data?.charts?.occasions?.data ?? [],
                backgroundColor: [
                    '#f11f18',
                    '#111111',
                    '#6b7280',
                    '#e11d48',
                    '#f59e0b',
                    '#10b981',
                ],
                hoverOffset: 6,
            },
        ],
    };

    // Chart 4: Polar Area / Radar Chart (Company Values Alignment)
    const companyValuesData = {
        labels: data?.charts?.company_values?.labels ?? [],
        datasets: [
            {
                label: 'Values Demonstrated',
                data: data?.charts?.company_values?.data ?? [],
                backgroundColor: [
                    'rgba(241, 31, 24, 0.7)',
                    'rgba(17, 17, 17, 0.7)',
                    'rgba(107, 114, 128, 0.7)',
                ],
            },
        ],
    };

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { font: { family: 'Roboto', weight: 'bold', size: 11 } },
            },
        },
    };

    return (
        <section className="grid gap-6">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <span className="text-xs font-extrabold tracking-[.14em] uppercase text-cod-gray">
                        Executive Intelligence & BI
                    </span>
                    <h1 className="text-3xl font-bold text-cod-gray">
                        Analytics & Multi-Format Exports
                    </h1>
                    <p className="text-sm text-cod-gray/75">
                        Interactive multi-chart analytics powered by Chart.js with universal cross-filtering and multi-format exports.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value)}
                        className="min-h-11 rounded-xl border border-cod-gray/30 bg-cararra px-3 py-2 text-xs font-bold uppercase tracking-wider text-cod-gray shadow-sm outline-none"
                    >
                        <option value="csv">CSV Format</option>
                        <option value="xlsx">XLSX (Excel)</option>
                        <option value="tsv">TSV (Tab-Separated)</option>
                        <option value="xml">XML (Structured)</option>
                    </select>
                    <a
                        href={`${apiRoutes.analyticsAdminSystemExport}?format=${exportFormat}`}
                        download
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-cod-gray bg-cod-gray px-4 py-2.5 text-sm font-bold text-cararra shadow-sm transition hover:border-pomegranate hover:bg-cod-gray/92"
                    >
                        <Icon name="download" /> Export ({exportFormat.toUpperCase()})
                    </a>
                </div>
            </header>

            {/* 3 Common Filters on Every Chart */}
            <div className="grid grid-cols-3 gap-4 rounded-2xl border border-cod-gray/20 bg-cararra p-4 shadow-sm max-md:grid-cols-1">
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-cod-gray/70">
                        Filter by Department
                    </label>
                    <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full text-sm"
                    >
                        <option value="">All Departments</option>
                        {data?.filter_options?.departments?.map((dept) => (
                            <option key={dept} value={dept}>
                                {dept}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-cod-gray/70">
                        Time Horizon
                    </label>
                    <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        className="w-full text-sm"
                    >
                        <option value="7">Last 7 Days</option>
                        <option value="14">Last 14 Days</option>
                        <option value="30">Last 30 Days</option>
                    </select>
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-cod-gray/70">
                        Filter by Occasion
                    </label>
                    <select
                        value={occasionId}
                        onChange={(e) => setOccasionId(e.target.value)}
                        className="w-full text-sm"
                    >
                        <option value="">All Occasions</option>
                        {data?.filter_options?.occasions?.map((occ) => (
                            <option key={occ.id} value={occ.id}>
                                {occ.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Program Totals */}
            <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
                <article className="rounded-2xl border border-cod-gray/20 bg-cararra p-4 shadow-sm">
                    <span className="text-xs font-semibold text-cod-gray/70">Filtered Headcount</span>
                    <strong className="mt-1 block text-2xl font-black text-cod-gray">
                        {data?.totals?.total_users ?? 0}
                    </strong>
                </article>
                <article className="rounded-2xl border border-cod-gray/20 bg-cararra p-4 shadow-sm">
                    <span className="text-xs font-semibold text-cod-gray/70">Filtered Balance Liability</span>
                    <strong className="mt-1 block text-2xl font-black text-cod-gray">
                        {data?.totals?.total_balance?.toLocaleString() ?? 0} pts
                    </strong>
                </article>
                <article className="rounded-2xl border border-cod-gray/20 bg-cararra p-4 shadow-sm">
                    <span className="text-xs font-semibold text-cod-gray/70">Points Awarded (Window)</span>
                    <strong className="mt-1 block text-2xl font-black text-green-700">
                        +{data?.totals?.total_points_awarded?.toLocaleString() ?? 0} pts
                    </strong>
                </article>
                <article className="rounded-2xl border border-cod-gray/20 bg-cararra p-4 shadow-sm">
                    <span className="text-xs font-semibold text-cod-gray/70">Points Redeemed (Window)</span>
                    <strong className="mt-1 block text-2xl font-black text-pomegranate">
                        -{data?.totals?.total_points_redeemed?.toLocaleString() ?? 0} pts
                    </strong>
                </article>
            </div>

            {/* 4 Interactive Charts Grid */}
            <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                {/* Chart 1: Line */}
                <div className="rounded-2xl border border-cod-gray/20 bg-cararra p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-cod-gray">1. Program Velocity (Recognitions vs Redemptions)</h2>
                        <span className="text-[11px] font-bold text-cod-gray/60">Line Chart</span>
                    </div>
                    <div className="h-64 w-full">
                        <Line data={velocityData} options={commonOptions} />
                    </div>
                </div>

                {/* Chart 2: Bar */}
                <div className="rounded-2xl border border-cod-gray/20 bg-cararra p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-cod-gray">2. Department Distribution (Points Awarded)</h2>
                        <span className="text-[11px] font-bold text-cod-gray/60">Bar Chart</span>
                    </div>
                    <div className="h-64 w-full">
                        <Bar data={departmentData} options={commonOptions} />
                    </div>
                </div>

                {/* Chart 3: Doughnut */}
                <div className="rounded-2xl border border-cod-gray/20 bg-cararra p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-cod-gray">3. Occasions Breakdown</h2>
                        <span className="text-[11px] font-bold text-cod-gray/60">Doughnut Chart</span>
                    </div>
                    <div className="h-64 w-full">
                        <Doughnut data={occasionData} options={commonOptions} />
                    </div>
                </div>

                {/* Chart 4: Polar Area */}
                <div className="rounded-2xl border border-cod-gray/20 bg-cararra p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-cod-gray">4. Company Values Engagement</h2>
                        <span className="text-[11px] font-bold text-cod-gray/60">Polar Area Chart</span>
                    </div>
                    <div className="h-64 w-full">
                        <PolarArea data={companyValuesData} options={commonOptions} />
                    </div>
                </div>
            </div>

            {/* Employee Balance Table */}
            <div className="rounded-2xl border border-cod-gray/20 bg-cararra p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-cod-gray">Employee Balance Liability</h2>
                        <p className="text-xs text-cod-gray/70">Filtered employee balances and active accounts</p>
                    </div>
                    <span className="rounded-full border border-cod-gray/20 px-3 py-1 text-xs font-semibold">
                        {data?.balance_meta?.total ?? data?.employee_balances?.length ?? 0} total accounts
                    </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-cod-gray/15">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="bg-cod-gray text-xs text-cararra">
                                <th className="p-3.5">Employee</th>
                                <th className="p-3.5">Department</th>
                                <th className="p-3.5">Job Title</th>
                                <th className="p-3.5">Status</th>
                                <th className="p-3.5 text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.employee_balances?.map((emp) => (
                                <tr key={emp.id} className="border-t border-cod-gray/15 text-cod-gray hover:bg-cod-gray/5">
                                    <td className="p-3.5">
                                        <strong className="block">{emp.name}</strong>
                                        <small className="text-cod-gray/65">{emp.email}</small>
                                    </td>
                                    <td className="p-3.5">{emp.department}</td>
                                    <td className="p-3.5">{emp.job_title}</td>
                                    <td className="p-3.5">
                                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${emp.is_active ? 'border-cod-gray bg-cod-gray text-cararra' : 'border-cod-gray/20 bg-cod-gray/5 text-cod-gray/65'}`}>
                                            {emp.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-3.5 text-right font-bold">
                                        {emp.balance.toLocaleString()} pts
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Balance Table Pagination */}
                {data?.balance_meta && (
                    <div className="mt-4 flex items-center justify-between border-t border-cod-gray/15 pt-4 text-xs">
                        <span className="text-cod-gray/70">
                            Showing page <strong className="text-cod-gray">{data.balance_meta.current_page}</strong> of{' '}
                            <strong className="text-cod-gray">{data.balance_meta.last_page}</strong> ({data.balance_meta.total} records)
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={data.balance_meta.current_page <= 1}
                                onClick={() => setBalancePage((p) => Math.max(1, p - 1))}
                                className="rounded-lg border border-cod-gray/30 px-3 py-1 font-semibold text-cod-gray transition hover:bg-cod-gray/5 disabled:opacity-40"
                            >
                                Previous
                            </button>
                            <span className="px-2 font-bold text-cod-gray">{data.balance_meta.current_page}</span>
                            <button
                                type="button"
                                disabled={data.balance_meta.current_page >= data.balance_meta.last_page}
                                onClick={() => setBalancePage((p) => p + 1)}
                                className="rounded-lg border border-cod-gray/30 px-3 py-1 font-semibold text-cod-gray transition hover:bg-cod-gray/5 disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
