import { useConnectivityQuery } from '../../queries/useConnectivityQuery';

export default function AppHeader({
    user,
    roles,
    view,
    canViewEmployees,
    onNavigate,
    onOpenEmployees,
    onLogout,
}) {
    const initials = user.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('');
    const connectivityQuery = useConnectivityQuery();
    const isHealthy = connectivityQuery.data?.status === 'ok';

    return (
        <header className="border-cod-gray bg-cod-gray sticky top-0 z-10 flex min-h-18 items-center gap-8 border-b px-[5vw] max-sm:flex-wrap max-sm:gap-2 max-sm:px-4 max-sm:py-3">
            <div className="text-cararra flex items-center gap-2.5 text-lg font-extrabold tracking-tight max-sm:w-full">
                <span className="border-pomegranate bg-cararra text-cod-gray grid size-8 place-items-center rounded-xl border-2">
                    B
                </span>
                <span>BrightThanks</span>
            </div>
            <nav className="flex flex-1 gap-2" aria-label="Primary navigation">
                <button
                    className={`relative px-3.5 py-6 text-sm font-semibold transition after:absolute after:right-3.5 after:bottom-0 after:left-3.5 after:h-0.5 after:rounded ${view === 'recognition' ? 'text-cararra after:bg-pomegranate' : 'text-cararra/70 hover:text-cararra after:bg-transparent'}`}
                    onClick={() => onNavigate('recognition')}
                >
                    Recognition
                </button>
                {canViewEmployees && (
                    <button
                        className={`relative px-3.5 py-6 text-sm font-semibold transition after:absolute after:right-3.5 after:bottom-0 after:left-3.5 after:h-0.5 after:rounded ${view === 'employees' ? 'text-cararra after:bg-pomegranate' : 'text-cararra/70 hover:text-cararra after:bg-transparent'}`}
                        onClick={onOpenEmployees}
                    >
                        Employees
                    </button>
                )}
            </nav>
            <div className="flex items-center gap-4 max-sm:ml-auto">
                <div
                    className="border-cararra/20 bg-cararra/10 text-cararra flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
                    title={
                        isHealthy
                            ? 'Services healthy (API + Database connected)'
                            : 'Checking connectivity...'
                    }
                >
                    <span
                        className={`size-2 rounded-full ${isHealthy ? 'bg-emerald-400' : 'animate-pulse bg-amber-400'}`}
                    />
                    <span className="max-sm:hidden">
                        {isHealthy ? 'Live' : 'Connecting'}
                    </span>
                </div>
                <span className="border-cararra/30 bg-cararra text-cod-gray grid size-9 place-items-center rounded-full border text-xs font-extrabold">
                    {initials}
                </span>
                <div className="grid text-right max-md:hidden">
                    <strong className="text-cararra text-sm">
                        {user.name}
                    </strong>
                    <small className="text-cararra/70 text-xs capitalize">
                        {roles.join(' / ') || 'Member'}
                    </small>
                </div>
                <button
                    className="border-cararra/40 text-cararra hover:border-pomegranate rounded-xl border bg-transparent px-4 py-2.5 text-sm font-bold transition hover:-translate-y-px"
                    onClick={onLogout}
                >
                    Sign out
                </button>
            </div>
        </header>
    );
}
