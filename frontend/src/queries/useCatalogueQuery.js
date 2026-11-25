import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { apiRoutes } from '../api/routes';
import { queryKeys } from './queryKeys';

export function useCatalogueQuery(filters) {
    return useQuery({
        queryKey: queryKeys.catalogue(filters),
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.search) params.set('search', filters.search);
            if (filters.category) params.set('category', filters.category);
            params.set('page', filters.page);
            params.set('per_page', 12);
            return apiClient.get(`${apiRoutes.catalogue}?${params}`).then((response) => response);
        },
        placeholderData: keepPreviousData,
    });
}
