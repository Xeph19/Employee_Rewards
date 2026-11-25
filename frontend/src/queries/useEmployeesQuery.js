import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { apiRoutes } from '../api/routes';
import { queryKeys } from './queryKeys';

export function useEmployeesQuery(page = 1, enabled = true, perPage = 10) {
    return useQuery({
        queryKey: typeof page === 'boolean' ? queryKeys.employees : ['employees', page, perPage],
        queryFn: async () => {
            const isPlainEnabled = typeof page === 'boolean';
            const targetPage = isPlainEnabled ? 1 : page;
            const res = await apiClient.get(`${apiRoutes.employees}?page=${targetPage}&per_page=${perPage}`);
            return res;
        },
        enabled: typeof page === 'boolean' ? page : enabled,
        placeholderData: keepPreviousData,
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
    });
}
