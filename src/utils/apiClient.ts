import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../config';

export interface ApiClientConfig extends AxiosRequestConfig {
    requireAuth?: boolean;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
    refreshSubscribers.forEach(cb => cb(token));
    refreshSubscribers = [];
};

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const instance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

instance.interceptors.request.use((config) => {
    const opts = config as ApiClientConfig;
    const requireAuth = opts.requireAuth !== false;
    if (requireAuth) {
        const token = Cookies.get('admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as ApiClientConfig & { _retry?: boolean };

        if (error.response?.status === 401 && originalRequest?.requireAuth !== false && !originalRequest._retry) {
            const refreshToken = Cookies.get('admin_refresh_token');

            if (!refreshToken) {
                Cookies.remove('admin_token');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            if (!isRefreshing) {
                originalRequest._retry = true;
                isRefreshing = true;
                try {
                    const refreshResponse = await axios.post(
                        `${API_BASE_URL}/auth/refresh`,
                        { refresh_token: refreshToken },
                        { headers: { 'Content-Type': 'application/json' } }
                    );
                    const refreshData = refreshResponse.data;

                    if (
                        refreshResponse.status === 200 &&
                        (refreshData.status || refreshData.success) &&
                        refreshData.data?.token
                    ) {
                        const newToken = refreshData.data.token;
                        const newRefresh = refreshData.data.refresh_token || refreshToken;
                        Cookies.set('admin_token', newToken, {
                            expires: 1,
                            secure: window.location.protocol === 'https:',
                            sameSite: 'strict',
                        });
                        Cookies.set('admin_refresh_token', newRefresh, {
                            expires: 1,
                            secure: window.location.protocol === 'https:',
                            sameSite: 'strict',
                        });
                        onRefreshed(newToken);
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return instance(originalRequest);
                    }
                } catch (refreshError) {
                    Cookies.remove('admin_token');
                    Cookies.remove('admin_refresh_token');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }

            return new Promise((resolve) => {
                subscribeTokenRefresh((newToken: string) => {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    resolve(instance(originalRequest));
                });
            });
        }

        return Promise.reject(error);
    }
);

function resolveUrl(endpoint: string): string {
    return endpoint.startsWith('http') ? endpoint : endpoint;
}

function getConfig(endpoint: string, config?: ApiClientConfig): ApiClientConfig {
    const url = resolveUrl(endpoint);
    return { ...config, url: url || endpoint };
}

export const api = {
    get<T = unknown>(endpoint: string, config?: ApiClientConfig): Promise<AxiosResponse<T>> {
        const { url, ...rest } = getConfig(endpoint, config);
        return instance.get<T>(url ?? endpoint, rest);
    },

    post<T = unknown>(endpoint: string, data?: unknown, config?: ApiClientConfig): Promise<AxiosResponse<T>> {
        const { url, ...rest } = getConfig(endpoint, config);
        return instance.post<T>(url ?? endpoint, data, rest);
    },

    put<T = unknown>(endpoint: string, data?: unknown, config?: ApiClientConfig): Promise<AxiosResponse<T>> {
        const { url, ...rest } = getConfig(endpoint, config);
        return instance.put<T>(url ?? endpoint, data, rest);
    },

    patch<T = unknown>(endpoint: string, data?: unknown, config?: ApiClientConfig): Promise<AxiosResponse<T>> {
        const { url, ...rest } = getConfig(endpoint, config);
        return instance.patch<T>(url ?? endpoint, data, rest);
    },

    delete<T = unknown>(endpoint: string, config?: ApiClientConfig): Promise<AxiosResponse<T>> {
        const { url, ...rest } = getConfig(endpoint, config);
        return instance.delete<T>(url ?? endpoint, rest);
    },
};

/** @deprecated Use api.get, api.post, api.put, api.delete instead */
export const apiClient = async (endpoint: string, options: RequestInit & { requireAuth?: boolean } = {}): Promise<Response> => {
    const { requireAuth = true, method = 'GET', body, ...rest } = options;
    const config: ApiClientConfig = { requireAuth, ...rest } as ApiClientConfig;
    try {
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
        if (method === 'GET') {
            const res = await api.get(url, config);
            return new Response(JSON.stringify(res.data), { status: res.status, headers: res.headers as unknown as HeadersInit });
        }
        if (method === 'POST') {
            const res = await api.post(url, body ? JSON.parse(body as string) : undefined, config);
            return new Response(JSON.stringify(res.data), { status: res.status, headers: res.headers as unknown as HeadersInit });
        }
        if (method === 'PUT') {
            const res = await api.put(url, body ? JSON.parse(body as string) : undefined, config);
            return new Response(JSON.stringify(res.data), { status: res.status, headers: res.headers as unknown as HeadersInit });
        }
        if (method === 'DELETE') {
            const res = await api.delete(url, config);
            return new Response(JSON.stringify(res.data), { status: res.status, headers: res.headers as unknown as HeadersInit });
        }
        return fetch(url, options);
    } catch (e: unknown) {
        const err = e as { response?: { status: number; data?: unknown }; message?: string };
        return new Response(JSON.stringify(err.response?.data ?? { message: err.message }), {
            status: err.response?.status ?? 500,
        });
    }
};
