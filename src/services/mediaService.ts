/**
 * mediaService.ts
 *
 * Cloudflare R2 Media Bucket Service
 *
 * ─────────────────────────────────────────────────────────────────────────
 * STUB MODE — Awaiting R2 worker endpoints from manager.
 *
 * When endpoints are ready, replace the three TODO sections below:
 *   1. R2_UPLOAD_URL  → signed-upload worker endpoint  (POST multipart)
 *   2. R2_LIST_URL    → list/index worker endpoint      (GET)
 *   3. R2_DELETE_URL  → delete worker endpoint          (DELETE /:key)
 *
 * Expected response shapes are documented next to each stub.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { apiClient } from '../utils/apiClient';
import type { ApiResponse } from './api';

// ── Endpoint constants (fill these in when manager shares them) ──────────
const R2_UPLOAD_URL = ''; // TODO: e.g. 'https://media-worker.eleastar.com/upload'
const R2_LIST_URL = ''; // TODO: e.g. 'https://media-worker.eleastar.com/files'
const R2_DELETE_URL = ''; // TODO: e.g. 'https://media-worker.eleastar.com/files'

// ── Types ────────────────────────────────────────────────────────────────
export interface MediaFile {
    key: string;          // R2 object key (filename in bucket)
    url: string;          // Public CDN URL
    name: string;         // Display name
    size: number;         // Bytes
    type: string;         // MIME type (e.g. 'image/jpeg')
    uploaded_at: string;  // ISO date string
}

export interface UploadProgress {
    file: File;
    progress: number;     // 0–100
    status: 'pending' | 'uploading' | 'done' | 'error';
    url?: string;
    error?: string;
}

// ── Service ──────────────────────────────────────────────────────────────
export const mediaService = {

    /**
     * Upload a file to the R2 bucket.
     *
     * Expected backend response:
     * { success: true, data: { key: string, url: string } }
     *
     * TODO: Replace stub once R2_UPLOAD_URL is provided.
     */
    uploadFile: async (
        file: File,
        onProgress?: (pct: number) => void,
    ): Promise<ApiResponse<{ key: string; url: string }>> => {
        // ── STUB ─────────────────────────────────────────────────────────
        if (!R2_UPLOAD_URL) {
            // Simulate upload with a fake object URL so UI works now
            return new Promise(resolve => {
                let pct = 0;
                const iv = setInterval(() => {
                    pct = Math.min(pct + 20, 100);
                    onProgress?.(pct);
                    if (pct === 100) {
                        clearInterval(iv);
                        const fakeUrl = URL.createObjectURL(file);
                        resolve({
                            success: true,
                            data: { key: `stub/${file.name}`, url: fakeUrl },
                            message: 'Stub upload — real R2 URL will appear once endpoint is configured',
                        });
                    }
                }, 150);
            });
        }
        // ── REAL R2 UPLOAD (uncomment when endpoint is ready) ────────────
        // const form = new FormData();
        // form.append('file', file);
        // const res = await fetch(R2_UPLOAD_URL, { method: 'POST', body: form });
        // const json = await res.json();
        // return { success: json.success, data: json.data, error: json.error };
        return { success: false, data: null as any, error: 'Upload endpoint not configured' };
    },

    /**
     * List all files in the R2 bucket.
     *
     * Expected backend response:
     * { success: true, data: MediaFile[] }
     *
     * TODO: Replace stub once R2_LIST_URL is provided.
     */
    listFiles: async (): Promise<ApiResponse<MediaFile[]>> => {
        // ── STUB ─────────────────────────────────────────────────────────
        if (!R2_LIST_URL) {
            return {
                success: true,
                data: [], // Empty until real endpoint is wired
                message: 'Stub list — connect R2_LIST_URL to see real files',
            };
        }
        // ── REAL ─────────────────────────────────────────────────────────
        try {
            const res = await apiClient(R2_LIST_URL, { requireAuth: true });
            const json = await res.json();
            return { success: json.success, data: json.data || [], error: json.error };
        } catch (e: any) {
            return { success: false, data: [], error: e.message };
        }
    },

    /**
     * Delete a file from the R2 bucket by key.
     *
     * Expected backend response:
     * { success: true }
     *
     * TODO: Replace stub once R2_DELETE_URL is provided.
     */
    deleteFile: async (key: string): Promise<ApiResponse<void>> => {
        // ── STUB ─────────────────────────────────────────────────────────
        if (!R2_DELETE_URL) {
            return { success: true, data: undefined, message: 'Stub delete' };
        }
        // ── REAL ─────────────────────────────────────────────────────────
        try {
            const res = await apiClient(`${R2_DELETE_URL}/${encodeURIComponent(key)}`, {
                method: 'DELETE',
                requireAuth: true,
            });
            const json = await res.json();
            return { success: json.success, data: undefined, error: json.error };
        } catch (e: any) {
            return { success: false, data: undefined, error: e.message };
        }
    },
};
