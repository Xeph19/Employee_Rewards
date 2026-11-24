import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { apiRoutes } from '../api/routes';
import { queryKeys } from './queryKeys';

export function useEmployeesQuery(enabled) {
    return useQuery({
        queryKey: queryKeys.employees,
        queryFn: async () => (await apiClient.get(apiRoutes.employees)).data,
        enabled,
        staleTime: 2 * 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
    });
}
