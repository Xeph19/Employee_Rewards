import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { apiRoutes } from '../api/routes';
import { queryKeys } from './queryKeys';

export function useRedemptionsQuery(page) {
    return useQuery({
        queryKey: queryKeys.redemptions(page),
        queryFn: () => apiClient.get(`${apiRoutes.redemptions}?page=${page}`),
        placeholderData: keepPreviousData,
    });
}
