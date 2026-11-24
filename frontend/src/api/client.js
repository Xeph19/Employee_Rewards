import { apiRoutes } from './routes';

const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';

export class ApiError extends Error {
    constructor(message, status, errors = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors;
    }
}

export const readCookie = (name) => {
    const prefix = `${name}=`;
    const value = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith(prefix));

    return value ? decodeURIComponent(value.slice(prefix.length)) : null;
};

const request = async (path, options = {}) => {
    const method = options.method ?? 'GET';
    const headers = {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
    };

    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        const token = readCookie('XSRF-TOKEN');
        if (token) headers['X-XSRF-TOKEN'] = token;
    }

    const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        method,
        headers,
        credentials: 'include',
    });

    if (response.status === 204) return null;

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new ApiError(
            payload.message ?? 'The request could not be completed.',
            response.status,
            payload.errors,
        );
    }

    return payload;
};

export const apiClient = {
    async csrf(force = false) {
        if (!force && readCookie('XSRF-TOKEN')) {
            return;
        }
        await fetch(`${baseUrl}${apiRoutes.csrf}`, { credentials: 'include' });
    },
    get(path) {
        return request(path);
    },
    post(path, data) {
        return request(path, { method: 'POST', body: JSON.stringify(data) });
    },
    patch(path, data) {
        return request(path, { method: 'PATCH', body: JSON.stringify(data) });
    },
    delete(path) {
        return request(path, { method: 'DELETE' });
    },
};
