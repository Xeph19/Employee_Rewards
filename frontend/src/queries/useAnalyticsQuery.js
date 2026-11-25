import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { apiRoutes } from '../api/routes';

export function useEmployeeAnalyticsQuery(enabled = true) {
    return useQuery({
        queryKey: ['analytics', 'employee'],
        queryFn: async () => (await apiClient.get(apiRoutes.analyticsEmployee)).data,
        enabled,
        staleTime: 30_000,
    });
}

export function useAdminSummaryQuery(filters = {}, enabled = true) {
    const params = new URLSearchParams();
    if (filters.department) params.append('department', filters.department);
    if (filters.timeframe) params.append('timeframe', filters.timeframe);
    if (filters.occasion_id) params.append('occasion_id', filters.occasion_id);
    if (filters.balance_page) params.append('balance_page', filters.balance_page);
    if (filters.balance_per_page) params.append('balance_per_page', filters.balance_per_page);

    const queryString = params.toString() ? `?${params.toString()}` : '';

    return useQuery({
        queryKey: ['analytics', 'admin', 'summary', filters],
        queryFn: async () => (await apiClient.get(`${apiRoutes.analyticsAdminSummary}${queryString}`)).data,
        enabled,
        staleTime: 30_000,
    });
}
