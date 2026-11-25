import { useState } from 'react';
import { useConnectivityQuery } from '../../queries/useConnectivityQuery';
import BrandMark from '../common/BrandMark';
import Button from '../common/Button';
import Icon from '../common/Icon';
import Tooltip from '../common/Tooltip';
import NotificationBell from '../common/NotificationBell';

export default function AppHeader({
    user,
    roles,
    view,
    canViewEmployees,
    notifications = [],
    onClearNotifications,
    onNavigate,
    onOpenEmployees,
    onLogout,
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const initials = user.name.split(' ').map((part) => part[0]).slice(0, 2).join('');
    const connectivityQuery = useConnectivityQuery();
    const isHealthy = connectivityQuery.data?.status === 'ok';

    const navigate = (destination) => {
        setMenuOpen(false);
        if (destination === 'employees') onOpenEmployees();
        else onNavigate(destination);
    };

    const navigation = [
        { id: 'recognition', label: 'Recognition', icon: 'recognition', description: 'Celebrate contributions and view company recognition.' },
        { id: 'redemption', label: 'Redeem', icon: 'gift', description: 'Browse rewards catalogue and spend points.' },
        { id: 'coupons', label: 'My Rewards', icon: 'ticket', description: 'View your redeemed vouchers, coupons, and merchant claim codes.' },
        ...(roles.includes('admin') ? [{ id: 'analytics', label: 'Analytics', icon: 'chart', description: 'View system totals, Chart.js velocity, and audit reports.' }] : []),
        ...(canViewEmployees ? [{ id: 'employees', label: 'Employees', icon: 'users', description: 'Manage profiles, roles, reporting lines, and eligibility.' }] : []),
    ];

    return (
        <header className="sticky top-0 z-30 border-b border-cod-gray bg-cod-gray text-cararra shadow-lg shadow-cod-gray/10">
            <div className="mx-auto grid min-h-18 w-[min(1240px,92vw)] grid-cols-[13rem_minmax(0,1fr)_18rem] items-center gap-4 max-lg:grid-cols-[11rem_minmax(0,1fr)_auto] max-md:grid-cols-[1fr_auto]">
                <div className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
                    <BrandMark className="size-9" />
                    <span>BrightThanks</span>
                </div>

                <nav className="hidden min-w-0 items-center justify-center gap-1 md:flex" aria-label="Primary navigation">
                    {navigation.map((item) => (
                        <Tooltip key={item.id} text={item.description}>
                            <Button variant={view === item.id ? 'navActive' : 'nav'} onClick={() => navigate(item.id)} aria-current={view === item.id ? 'page' : undefined}>
                                <Icon name={item.icon} /> {item.label}
                            </Button>
                        </Tooltip>
                    ))}
                </nav>

                <div className="hidden min-w-0 items-center justify-end gap-3 md:flex">
                    <div className="flex items-center gap-1.5 rounded-full border border-cararra/20 bg-cararra/10 px-3 py-1 text-xs" title={isHealthy ? 'Services healthy' : 'Checking connectivity'}>
                        <span className={`size-2 rounded-full ${isHealthy ? 'bg-pomegranate' : 'animate-pulse bg-cararra/50'}`} />
                        <span>{isHealthy ? 'Live' : 'Connecting'}</span>
                    </div>
                    <NotificationBell notifications={notifications} onClear={onClearNotifications} />
                    <span className="grid size-9 shrink-0 aspect-square place-items-center rounded-full border border-cararra/30 bg-cararra text-xs font-extrabold text-cod-gray leading-none">{initials}</span>
                    <div className="grid max-lg:hidden">
                        <strong className="max-w-28 truncate text-sm">{user.name}</strong>
                        <small className="text-xs text-cararra/70 capitalize">{roles.join(' / ') || 'Member'}</small>
                    </div>
                    <Button variant="inverse" onClick={onLogout}><Icon name="logout" /><span className="max-xl:hidden">Sign out</span></Button>
                </div>

                <Button variant="inverse" size="icon" className="justify-self-end md:hidden" aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} onClick={() => setMenuOpen((open) => !open)}>
                    <Icon name={menuOpen ? 'close' : 'menu'} className="size-5" />
                </Button>
            </div>

            {menuOpen && (
                <div id="mobile-navigation" className="border-t border-cararra/15 bg-cod-gray px-[4vw] py-4 md:hidden">
                    <nav className="grid gap-2" aria-label="Mobile navigation">
                        {navigation.map((item) => (
                            <Button key={item.id} variant={view === item.id ? 'navActive' : 'nav'} className="w-full justify-start" onClick={() => navigate(item.id)} aria-current={view === item.id ? 'page' : undefined}>
                                <Icon name={item.icon} />
                                <span className="grid text-left"><strong>{item.label}</strong><small className="font-normal text-cararra/60">{item.description}</small></span>
                            </Button>
                        ))}
                    </nav>
                    <div className="mt-4 flex items-center gap-3 border-t border-cararra/15 pt-4">
                        <span className="grid size-10 shrink-0 aspect-square place-items-center rounded-full bg-cararra text-xs font-extrabold text-cod-gray leading-none">{initials}</span>
                        <div className="min-w-0 flex-1"><strong className="block truncate text-sm">{user.name}</strong><small className="text-xs text-cararra/60 capitalize">{roles.join(' / ') || 'Member'}</small></div>
                        <Button variant="inverse" onClick={onLogout}><Icon name="logout" /> Sign out</Button>
                    </div>
                </div>
            )}
        </header>
    );
}
