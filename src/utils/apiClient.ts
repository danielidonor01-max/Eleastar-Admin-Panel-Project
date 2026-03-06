import Cookies from 'js-cookie';
import { API_BASE_URL } from '../config';

interface ApiClientOptions extends RequestInit {
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

export const apiClient = async (endpoint: string, options: ApiClientOptions = {}): Promise<Response> => {
    const { requireAuth = true, ...customOptions } = options;

    const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    let token = Cookies.get('admin_token');

    if (requireAuth && token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...customOptions,
        headers: {
            ...defaultHeaders,
            ...customOptions.headers,
        },
    };

    // Make the initial request
    let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle 401 Unauthorized
    if (response.status === 401 && requireAuth) {
        // We assume token might be refreshed or handled
        const refreshToken = Cookies.get('admin_refresh_token');

        if (!refreshToken) {
            // Force logout if no refresh token
            Cookies.remove('admin_token');
            window.location.href = '/login';
            return response;
        }

        if (!isRefreshing) {
            isRefreshing = true;
            try {
                // Call refresh endpoint
                const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh_token: refreshToken }) // Note: adjust field name based on backend schema
                });

                const refreshData = await refreshResponse.json();

                if (refreshResponse.ok && (refreshData.status || refreshData.success) && refreshData.data?.token) {
                    const newToken = refreshData.data.token;
                    const newRefresh = refreshData.data.refresh_token || refreshToken;

                    Cookies.set('admin_token', newToken, { expires: 1, secure: window.location.protocol === 'https:', sameSite: 'strict' });
                    Cookies.set('admin_refresh_token', newRefresh, { expires: 1, secure: window.location.protocol === 'https:', sameSite: 'strict' });

                    isRefreshing = false;
                    onRefreshed(newToken);
                } else {
                    // Refresh failed, logout
                    Cookies.remove('admin_token');
                    Cookies.remove('admin_refresh_token');
                    window.location.href = '/login';
                    return response;
                }
            } catch (error) {
                Cookies.remove('admin_token');
                Cookies.remove('admin_refresh_token');
                window.location.href = '/login';
                isRefreshing = false;
                return response;
            }
        }

        // Wait for refresh to complete and retry the request
        return new Promise((resolve) => {
            subscribeTokenRefresh((newToken) => {
                // Retry original request with new token
                const retryConfig = { ...config };
                retryConfig.headers = {
                    ...retryConfig.headers,
                    'Authorization': `Bearer ${newToken}`
                };
                resolve(fetch(`${API_BASE_URL}${endpoint}`, retryConfig));
            });
        });
    }

    return response;
};
