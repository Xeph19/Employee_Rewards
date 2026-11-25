import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { apiClient } from './api/client';
import { apiRoutes } from './api/routes';
import LoadingScreen from './components/common/LoadingScreen';
import Button from './components/common/Button';
import ConfirmDialog from './components/common/ConfirmDialog';
import AppHeader from './components/layout/AppHeader';
import ErrorBoundary from './components/common/ErrorBoundary';
import EmployeesPage from './pages/EmployeesPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import LoginPage from './pages/LoginPage';
import RecognitionPage from './pages/RecognitionPage';
import RedemptionPage from './pages/RedemptionPage';
import MyCouponsPage from './pages/MyCouponsPage';
import { queryKeys } from './queries/queryKeys';
import { useDashboardQuery } from './queries/useDashboardQuery';

export default function App() {
    const queryClient = useQueryClient();
    const [view, setView] = useState('recognition');
    const [notice, setNotice] = useState('');
    const [signOutOpen, setSignOutOpen] = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const [notifications, setNotifications] = useState(() => [
        {
            id: 'welcome-notice',
            title: 'Welcome to BrightThanks!',
            message: 'Celebrate team members, claim rewards, and stay tuned for automatic birthday & work anniversary awards.',
            icon: 'sparkle',
            time: 'Today',
        },
    ]);
    const dashboardQuery = useDashboardQuery();
    const dashboard = dashboardQuery.data;

    const addNotification = (title, message, icon = 'sparkle') => {
        const item = {
            id: crypto.randomUUID(),
            title,
            message,
            icon,
            time: 'Just now',
        };
        setNotifications((prev) => [item, ...prev]);
    };

    const refreshDashboard = async (message, refresh = true, notifyData = null) => {
        setNotice(message);
        if (notifyData) {
            addNotification(notifyData.title, notifyData.message, notifyData.icon ?? 'sparkle');
        } else if (message) {
            addNotification('Action Confirmed', message, 'sparkle');
        }
        if (refresh) {
            await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
        }
    };

    const refreshEmployees = async () => {
        await queryClient.invalidateQueries({ queryKey: queryKeys.employees });
    };

    const logout = async () => {
        setSigningOut(true);
        try {
            await apiClient.delete(apiRoutes.session);
        } catch {
            // Non-blocking logout network error
        } finally {
            queryClient.clear();
            queryClient.setQueryData(queryKeys.dashboard, null);
            setView('recognition');
            setSignOutOpen(false);
            setSigningOut(false);
            // Trigger refetch so dashboardQuery registers 401 and transitions to LoginPage
            void dashboardQuery.refetch();
        }
    };

    if (dashboardQuery.isPending) return <LoadingScreen />;
    if (!dashboard || dashboardQuery.error?.status === 401) {
        return (
            <LoginPage
                onAuthenticated={(initialDashboard) => {
                    if (initialDashboard) {
                        queryClient.setQueryData(
                            queryKeys.dashboard,
                            initialDashboard,
                        );
                    } else {
                        void queryClient.invalidateQueries({
                            queryKey: queryKeys.dashboard,
                        });
                    }
                }}
            />
        );
    }
    if (dashboardQuery.isError) {
        return (
            <main className="bg-cararra text-cod-gray grid min-h-screen place-content-center gap-4 px-6 text-center">
                <h1 className="text-2xl font-bold">
                    The rewards service is unavailable
                </h1>
                <p>Check the API connection and try again.</p>
                <Button
                    size="lg"
                    className="mx-auto"
                    onClick={() => dashboardQuery.refetch()}
                >
                    Try again
                </Button>
            </main>
        );
    }

    return (
        <div className="bg-cararra text-cod-gray min-h-screen">
            <AppHeader
                user={dashboard.user}
                roles={dashboard.roles}
                view={view}
                canViewEmployees={dashboard.permissions.view_employees}
                notifications={notifications}
                onClearNotifications={() => setNotifications([])}
                onNavigate={setView}
                onOpenEmployees={() => setView('employees')}
                onLogout={() => setSignOutOpen(true)}
            />
            <main className="mx-auto w-[min(1180px,92vw)] py-8 pb-16">
                {notice && (
                    <div role="status" aria-live="polite" className="border-pomegranate bg-cararra text-cod-gray mb-4 rounded-xl border-l-4 px-4 py-3.5 font-medium shadow-sm flex items-center justify-between">
                        <span>{notice}</span>
                        <button type="button" onClick={() => setNotice('')} className="text-xs font-bold text-cod-gray/50 hover:text-cod-gray">Dismiss</button>
                    </div>
                )}
                <ErrorBoundary onReset={() => setView('recognition')}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={view}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                        >
                            {view === 'employees' ? (
                                <EmployeesPage
                                    canManage={Boolean(dashboard.permissions?.manage)}
                                    onCreated={refreshEmployees}
                                />
                            ) : view === 'analytics' ? (
                                <AdminAnalyticsPage />
                            ) : view === 'redemption' ? (
                                <RedemptionPage
                                    balance={dashboard.wallet?.balance ?? 0}
                                    canManage={Boolean(dashboard.permissions?.manage)}
                                    onRedeemed={(msg) => refreshDashboard(msg, true, {
                                        title: 'Reward Redeemed',
                                        message: msg,
                                        icon: 'ticket',
                                    })}
                                />
                            ) : view === 'coupons' ? (
                                <MyCouponsPage onNavigateRedeem={() => setView('redemption')} />
                            ) : (
                                <RecognitionPage
                                    data={dashboard}
                                    onChanged={(msg, refresh) => refreshDashboard(msg, refresh, {
                                        title: 'Recognition Update',
                                        message: msg,
                                        icon: 'sparkle',
                                    })}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </ErrorBoundary>
            </main>
            <ConfirmDialog
                open={signOutOpen}
                title="Employee Administration: Sign Out"
                description="Are you sure you want to sign out of BrightThanks?"
                confirmLabel="Sign Out"
                loading={signingOut}
                onCancel={() => setSignOutOpen(false)}
                onConfirm={logout}
            />
        </div>
    );
}
