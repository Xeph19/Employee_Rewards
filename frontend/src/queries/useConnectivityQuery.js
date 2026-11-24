import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { apiRoutes } from '../api/routes';
import { queryKeys } from './queryKeys';

export function useConnectivityQuery() {
    return useQuery({
        queryKey: queryKeys.connectivity,
        queryFn: () => apiClient.get(apiRoutes.connectivity),
        refetchInterval: 60_000,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: 1,
    });
}
