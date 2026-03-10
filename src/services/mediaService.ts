import { r2Api } from '../utils/apiClient';
import type { ApiResponse } from './api';
import type { MediaFile } from '@/types/media';

export const MAX_FILE_SIZE = 50 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/quicktime',
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const mediaService = {
    uploadFile: async (
        file: File,
        onProgress?: (percent: number) => void
    ): Promise<ApiResponse<{ key: string; url: string } | null>> => {
        if (file.size > MAX_FILE_SIZE) {
            return {
                success: false,
                data: null,
                error: `File too large. Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
            };
        }

        try {
            const { data } = await r2Api.upload(file, { onUploadProgress: onProgress });

            const payload = data?.data ?? data;
            const success = data?.success ?? true;
            const message = data?.message;
            const result: { key: string; url: string } | null = payload?.key
                ? { key: payload.key, url: payload.url ?? payload.key }
                : null;

            return {
                success,
                data: result,
                message,
                error: data?.error,
            };
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string; error?: string } }; message?: string };
            const msg = err?.response?.data?.message ?? err?.response?.data?.error ?? err?.message ?? 'Upload failed';
            return { success: false, data: null, error: msg };
        }
    },

    listFiles: async (): Promise<ApiResponse<MediaFile[]>> => {
        try {
            const { data } = await r2Api.list();
            const items = data?.data ?? data ?? [];
            const files = Array.isArray(items) ? items : [];
            return {
                success: data?.success ?? true,
                data: files,
                error: data?.error,
            };
        } catch (e: unknown) {
            const err = e as { message?: string };
            return {
                success: false,
                data: [],
                error: err?.message ?? 'Failed to load media',
            };
        }
    },

    deleteFile: async (key: string): Promise<ApiResponse<void>> => {
        try {
            const { data } = await r2Api.delete(encodeURIComponent(key));
            return {
                success: data?.success ?? true,
                data: undefined,
                error: data?.error,
            };
        } catch (e: unknown) {
            const err = e as { message?: string };
            return {
                success: false,
                data: undefined,
                error: err?.message ?? 'Delete failed',
            };
        }
    },
};
