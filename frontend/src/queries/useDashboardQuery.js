import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { apiRoutes } from '../api/routes';
import { queryKeys } from './queryKeys';

export function useDashboardQuery() {
    return useQuery({
        queryKey: queryKeys.dashboard,
        queryFn: async () => (await apiClient.get(apiRoutes.dashboard)).data,
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
    });
}
