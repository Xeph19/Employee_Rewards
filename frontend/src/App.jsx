import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api/client';
import { apiRoutes } from './api/routes';
import LoadingScreen from './components/common/LoadingScreen';
import AppHeader from './components/layout/AppHeader';
import EmployeesPage from './pages/EmployeesPage';
import LoginPage from './pages/LoginPage';
import RecognitionPage from './pages/RecognitionPage';
import { queryKeys } from './queries/queryKeys';
import { useDashboardQuery } from './queries/useDashboardQuery';
import { useEmployeesQuery } from './queries/useEmployeesQuery';

export default function App() {
    const queryClient = useQueryClient();
    const [view, setView] = useState('recognition');
    const [notice, setNotice] = useState('');
    const dashboardQuery = useDashboardQuery();
    const dashboard = dashboardQuery.data;
    const employeesQuery = useEmployeesQuery(
        view === 'employees' && Boolean(dashboard?.permissions.view_employees),
    );

    const refreshDashboard = async (message) => {
        await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
        setNotice(message);
    };

    const refreshEmployees = async () => {
        await queryClient.invalidateQueries({ queryKey: queryKeys.employees });
    };

    const logout = async () => {
        await apiClient.delete(apiRoutes.session);
        queryClient.clear();
        setView('recognition');
    };

    if (dashboardQuery.isPending) return <LoadingScreen />;
    if (!dashboard && dashboardQuery.error?.status === 401) {
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
                <button
                    className="bg-cod-gray text-cararra hover:outline-pomegranate rounded-xl px-5 py-3 font-bold hover:outline-2"
                    onClick={() => dashboardQuery.refetch()}
                >
                    Try again
                </button>
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
                onNavigate={setView}
                onOpenEmployees={() => setView('employees')}
                onLogout={logout}
            />
            <main className="mx-auto w-[min(1180px,92vw)] py-8 pb-16">
                {notice && (
                    <div className="border-pomegranate bg-cararra text-cod-gray mb-4 rounded-xl border-l-4 px-4 py-3.5 font-medium shadow-sm">
                        {notice}
                    </div>
                )}
                {view === 'employees' ? (
                    <EmployeesPage
                        employees={employeesQuery.data ?? []}
                        loading={employeesQuery.isPending}
                        canManage={dashboard.permissions.manage}
                        onCreated={refreshEmployees}
                    />
                ) : (
                    <RecognitionPage
                        data={dashboard}
                        onChanged={refreshDashboard}
                    />
                )}
            </main>
        </div>
    );
}
