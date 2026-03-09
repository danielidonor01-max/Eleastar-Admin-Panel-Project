import axios, { type AxiosRequestConfig, type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
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

const req = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

req.interceptors.request.use((config: InternalAxiosRequestConfig<unknown>) => {
    const opts = config as unknown as ApiClientConfig;
    const requireAuth = opts.requireAuth !== false;
    if (requireAuth) {
        const token = Cookies.get('admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

req.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
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
                    const refreshResponse = await api.post(
                        '/auth/refresh',
                        { refresh_token: refreshToken },
                        { requireAuth: false }
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
                        if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return req(originalRequest);
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
                    if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    resolve(req(originalRequest));
                });
            });
        }

        return Promise.reject(error);
    }
);

export const api = {
    get(endpoint: string, config?: ApiClientConfig): Promise<AxiosResponse> {
        return req.get(endpoint, config);
    },

    post(endpoint: string, data?: unknown, config?: ApiClientConfig): Promise<AxiosResponse> {
        return req.post(endpoint, data, config);
    },

    put(endpoint: string, data?: unknown, config?: ApiClientConfig): Promise<AxiosResponse> {
        return req.put(endpoint, data, config);
    },

    patch(endpoint: string, data?: unknown, config?: ApiClientConfig): Promise<AxiosResponse> {
        return req.patch(endpoint, data, config);
    },

    delete(endpoint: string, config?: ApiClientConfig): Promise<AxiosResponse> {
        return req.delete(endpoint, config);
    },
};
