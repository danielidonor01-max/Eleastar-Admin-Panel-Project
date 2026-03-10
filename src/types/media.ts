export interface MediaFile {
    key: string;
    url: string;
    name: string;
    size: number;
    type: string;
    uploaded_at: string;
}

export interface UploadProgress {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'done' | 'error';
    url?: string;
    error?: string;
}
