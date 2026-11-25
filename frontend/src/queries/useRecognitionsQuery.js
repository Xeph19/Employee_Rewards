import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { apiRoutes } from '../api/routes';
import { queryKeys } from './queryKeys';

export function useRecognitionsQuery(page) {
    return useQuery({
        queryKey: queryKeys.recognitions(page),
        queryFn: () => apiClient.get(`${apiRoutes.recognitions}?page=${page}`),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });
}
