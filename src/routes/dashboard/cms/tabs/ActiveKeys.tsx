import { toast } from "sonner";
import { cmsService } from "@/services/cmsService";
import type { CMSApiKey } from "@/types";
import { CheckCircle, Copy, Plus, RefreshCw ,ToggleRight, ToggleLeft, Trash2, Key, Lock as LockIcon} from "lucide-react";
import { useCallback, useEffect, useState } from "react";


function copyToClipboard(text: string, onDone?: () => void) {
    navigator.clipboard.writeText(text).then(() => onDone && onDone());
}


const ApiKeysTab = () => {
    
    const [keys, setKeys] = useState<CMSApiKey[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [revealedKey, setRevealedKey] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | number | null>(null);

    const loadKeys = useCallback(async () => {
        setLoading(true);
        try {
            const res = await cmsService.listApiKeys();
            if (res.success) setKeys(res.data || []);
        } catch { 
            toast.error('Error', { description: 'Failed to load API keys.' });
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadKeys(); }, [loadKeys]);

    const handleCreate = async () => {
        if (!newKeyName.trim()) return;
        setCreating(true);
        try {
            const res = await cmsService.generateApiKey(newKeyName.trim());
            if (res.success) {
                setRevealedKey(res.data?.key || null);
                showSuccess({ title: 'API Key Created', message: `"${newKeyName}" key was created successfully.` });
                setNewKeyName('');
                await loadKeys();
            } else {
                toast.error('Creation Failed', { description: res.error || 'Unable to create key.' });
            }
        } catch (e: unknown) {
            toast.error('Error', { description: e instanceof Error ? e.message : 'Unknown error' });
        } finally { setCreating(false); }
    };

    const handleDelete = async (id: string | number) => {
        if (!window.confirm('Delete this API key? This cannot be undone.')) return;
        try {
            const res = await cmsService.deleteApiKey(id);
            if (res.success) {
                setKeys(prev => prev.filter(k => k.id !== id));
                toast.success('Deleted', { description: 'API Key removed.' });
            } else {
                toast.error('Error', { description: res.error || 'Delete failed.' });
            }
        } catch (e: unknown) { toast.error('Error', { description: e instanceof Error ? e.message : 'Unknown error' }); }
    };

    const handleToggle = async (id: string | number, currentActive: boolean | number) => {
        const next = !currentActive;
        try {
            const res = await cmsService.toggleApiKeyStatus(id, next);
            if (res.success) {
                setKeys(prev => prev.map(k => k.id === id ? { ...k, is_active: next } : k));
                toast.success('Updated', { description: `Key status set to ${next ? 'active' : 'inactive'}.` });
            }
        } catch (e: unknown) { toast.error('Error', { description: e instanceof Error ? e.message : 'Unknown error' }); }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">API Keys</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Manage public access keys for external frontends.</p>
                </div>
                <button onClick={loadKeys} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Revealed Key Banner */}
            {revealedKey && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="font-semibold text-green-700 text-sm">New key created — copy it now, it won't show again.</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-lg border border-green-200 px-3 py-2">
                        <code className="flex-1 text-xs font-mono text-green-800 break-all">{revealedKey}</code>
                        <button
                            onClick={() => { copyToClipboard(revealedKey, () => { setCopiedId('new'); setTimeout(() => setCopiedId(null), 2000); }); }}
                            className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900 font-medium px-2 py-1 bg-green-100 rounded"
                        >
                            <Copy size={12} /> {copiedId === 'new' ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <button onClick={() => setRevealedKey(null)} className="text-xs text-green-500 mt-2 hover:underline">Dismiss</button>
                </div>
            )}

            {/* Create New Key */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Plus size={14} /> Generate New API Key</h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newKeyName}
                        onChange={e => setNewKeyName(e.target.value)}
                        placeholder="Key name (e.g. Frontend Production)"
                        className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    />
                    <button
                        onClick={handleCreate}
                        disabled={creating || !newKeyName.trim()}
                        className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {creating ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </div>

            {/* Keys List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">Active Keys ({keys.length})</span>
                </div>
                {loading ? (
                    <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
                ) : keys.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                        <LockIcon size={32} className="text-slate-300" />
                        No API keys yet. Create one above.
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {keys.map(k => (
                            <li key={k.id} className="px-4 py-3 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Key size={16} className={k.is_active ? 'text-brand-500' : 'text-slate-300'} />
                                    <div>
                                        <div className="text-sm font-medium text-slate-700">{k.name}</div>
                                        <div className="text-xs text-slate-400">{k.created_at ? new Date(k.created_at).toLocaleDateString() : 'Unknown date'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${k.is_active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                        {k.is_active ? 'active' : 'inactive'}
                                    </span>
                                    <button
                                        onClick={() => handleToggle(k.id, k.is_active)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                                        title={k.is_active ? 'Disable' : 'Enable'}
                                    >
                                        {k.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(k.id)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                        title="Delete Key"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ApiKeysTab;

