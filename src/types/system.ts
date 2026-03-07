// =============================================================================
// SYSTEM — API Keys & Generic API Wrapper
// =============================================================================

/**
 * A tenant-scoped API key used for integrations.
 * The full key is never exposed; only a preview of the first and last characters.
 */
export interface SystemApiKey {
    id: string;
    tenantId: string;
    name: string;
    /** Partial display value, e.g. "sk-ab...xy" */
    keyPreview: string;
    createdAt: string;
    status: 'active' | 'disabled';
}

/**
 * Generic wrapper for all API responses.
 * @template T The shape of the response data payload.
 */
export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    error?: string;
}
