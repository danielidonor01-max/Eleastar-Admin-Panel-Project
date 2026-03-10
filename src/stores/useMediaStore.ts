import { create } from 'zustand';
import { toast } from 'sonner';
import { mediaService } from '../services/mediaService';
import type { MediaFile } from '@/types/media';
import type { UploadProgress } from '@/types/media';

interface MediaState {
    files: MediaFile[];
    uploads: UploadProgress[];
    loading: boolean;
    error: string | null;
}

interface MediaActions {
    loadFiles: () => Promise<void>;
    uploadFiles: (fileList: FileList | File[]) => Promise<void>;
    deleteFile: (key: string) => Promise<boolean>;
    clearUpload: (file: File) => void;
    clearCompletedUploads: () => void;
    setError: (error: string | null) => void;
}

export const useMediaStore = create<MediaState & MediaActions>((set, get) => ({
    files: [],
    uploads: [],
    loading: false,
    error: null,

    loadFiles: async () => {
        set({ loading: true, error: null });
        try {
            const res = await mediaService.listFiles();
            if (res.success && res.data) {
                set({ files: res.data });
            } else {
                set({ error: res.error ?? 'Failed to load media' });
                toast.error('Error', { description: res.error ?? 'Failed to load media.' });
            }
        } catch {
            set({ error: 'Failed to load media' });
            toast.error('Error', { description: 'Failed to load media.' });
        } finally {
            set({ loading: false });
        }
    },

    uploadFiles: async (fileList: FileList | File[]) => {
        const toUpload = Array.from(fileList);
        if (toUpload.length === 0) return;

        const newUploads: UploadProgress[] = toUpload.map((f) => ({
            file: f,
            progress: 0,
            status: 'pending',
        }));
        set((s) => ({ uploads: [...newUploads, ...s.uploads] }));

        for (const up of newUploads) {
            set((s) => ({
                uploads: s.uploads.map((u) =>
                    u.file === up.file ? { ...u, status: 'uploading' as const } : u
                ),
            }));

            try {
                const res = await mediaService.uploadFile(up.file, (pct) => {
                    set((s) => ({
                        uploads: s.uploads.map((u) =>
                            u.file === up.file ? { ...u, progress: pct } : u
                        ),
                    }));
                });

                if (res.success && res.data) {
                    set((s) => ({
                        uploads: s.uploads.map((u) =>
                            u.file === up.file
                                ? { ...u, status: 'done' as const, url: res.data!.url, progress: 100 }
                                : u
                        ),
                    }));
                    toast.success('Uploaded', { description: `${up.file.name} is ready.` });
                    await get().loadFiles();
                } else {
                    set((s) => ({
                        uploads: s.uploads.map((u) =>
                            u.file === up.file
                                ? {
                                      ...u,
                                      status: 'error' as const,
                                      error: res.error ?? 'Upload failed',
                                  }
                                : u
                        ),
                    }));
                    toast.error('Upload Failed', { description: res.error ?? up.file.name });
                }
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : 'Unknown error';
                set((s) => ({
                    uploads: s.uploads.map((u) =>
                        u.file === up.file ? { ...u, status: 'error' as const, error: msg } : u
                    ),
                }));
                toast.error('Upload Failed', { description: msg });
            }
        }
    },

    deleteFile: async (key: string) => {
        const res = await mediaService.deleteFile(key);
        if (res.success) {
            set((s) => ({ files: s.files.filter((f) => f.key !== key) }));
            toast.success('Deleted', { description: 'File removed from bucket.' });
            return true;
        }
        toast.error('Delete Failed', { description: res.error ?? 'Unknown error' });
        return false;
    },

    clearUpload: (file: File) => {
        set((s) => ({ uploads: s.uploads.filter((u) => u.file !== file) }));
    },

    clearCompletedUploads: () => {
        set((s) => ({ uploads: s.uploads.filter((u) => u.status !== 'done') }));
    },

    setError: (error: string | null) => {
        set({ error });
    },
}));
