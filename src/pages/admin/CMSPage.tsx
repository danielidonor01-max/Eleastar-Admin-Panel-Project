import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useCMS } from '../../context/CMSContext';
import { useFeedback } from '../../context/FeedbackContext';
import {
    Save, AlertCircle, CheckCircle, Eye, Layout, FileCode, Plus, X,
    ToggleLeft, ToggleRight,
    Trash2, Key, Globe, FolderOpen, Menu,
    EyeOff, PlusCircle, RefreshCw, Copy, Edit2, Lock as LockIcon
} from 'lucide-react';
import { DynamicJsonEditor } from '../../components/DynamicJsonEditor';
import { CMSPreviewPane } from '../../components/CMSPreviewPane';
import { PUBLIC_LINK } from '../../config';
import { cmsService } from '../../services/cmsService';

// ──────────────────────────────────────────────
// Sub-module types
// ──────────────────────────────────────────────
export type CMSModule = 'pages' | 'menus' | 'apikeys' | 'settings';

export interface CMSApiKey {
    id: string | number;
    name: string;
    key?: string;
    is_active: boolean | number;
    created_at?: string;
}

export interface CMSMenuItem {
    id: string | number;
    label: string;
    url: string;
    order?: number;
    is_visible?: boolean;
    parent_id?: string | number | null;
    children?: CMSMenuItem[];
}

export interface CMSMenu {
    id: string | number;
    name: string;
    key: string;
    items?: CMSMenuItem[];
}

export interface CMSPageItem {
    id?: string | number;
    title: string;
    slug: string;
    status?: 'live' | 'draft';
    meta_title?: string;
    meta_description?: string;
    created_at?: string;
}

// ──────────────────────────────────────────────
// Helper: copy to clipboard
// ──────────────────────────────────────────────
// ──────────────────────────────────────────────
// SEO Settings Modal
// ──────────────────────────────────────────────
const SEOSettingsModal: React.FC<{
    page: CMSPageItem;
    onClose: () => void;
    onSave: (payload: any) => Promise<void>;
}> = ({ page, onClose, onSave }) => {
    const [title, setTitle] = useState(page.meta_title || '');
    const [description, setDescription] = useState(page.meta_description || '');
    const [keywords, setKeywords] = useState((page as any).meta_keywords || '');
    const [author, setAuthor] = useState((page as any).meta_author || 'Eleastar Technologies Ltd.');

    // OG Tags
    const [ogTitle, setOgTitle] = useState((page as any).og_title || '');
    const [ogDescription, setOgDescription] = useState((page as any).og_description || '');
    const [ogImageUrl, setOgImageUrl] = useState((page as any).og_image_url || '');

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave({
                meta_title: title,
                meta_description: description,
                meta_keywords: keywords,
                meta_author: author,
                og_title: ogTitle,
                og_description: ogDescription,
                og_image_url: ogImageUrl
            });
            onClose();
        } catch { /* error handled by parent */ } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">SEO & Social Metadata</h3>
                        <p className="text-xs text-slate-500 font-inter">Configure how "{page.slug}" appears in search engines and social media.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors" title="Close">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6 space-y-8">
                    {/* Search Engine Result Preview */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2 block font-inter">Google Search Preview</span>
                        <div className="space-y-1">
                            <div className="text-[#1a0dab] text-xl hover:underline cursor-pointer truncate font-inter">{title || page.title || 'Page Title'}</div>
                            <div className="text-[#006621] text-sm truncate font-inter">eleastar.com › {page.slug}</div>
                            <div className="text-[#545454] text-sm line-clamp-2 leading-relaxed font-inter">
                                {description || 'No description provided. This is how your page will appear in search results.'}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Meta Section */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Globe size={14} /> Basic SEO
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1 font-inter uppercase tracking-tight">Focus Keywords</label>
                                    <input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="e.g. technology, innovation, Nigeria" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all font-inter" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1 font-inter uppercase tracking-tight">Author / Publisher</label>
                                    <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all font-inter" />
                                </div>
                                <div className="pt-2">
                                    <label className="block text-xs font-bold text-slate-700 mb-1 font-inter uppercase tracking-tight">Meta Title Override</label>
                                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder={page.title} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all font-inter" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1 font-inter uppercase tracking-tight">Meta Description</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Brief summary of the page content..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none font-inter" />
                                </div>
                            </div>
                        </div>

                        {/* Social Section */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Eye size={14} /> Social Share (OG)
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1 font-inter uppercase tracking-tight">OG Image URL</label>
                                    <div className="flex gap-2">
                                        <input value={ogImageUrl} onChange={e => setOgImageUrl(e.target.value)} placeholder="/images/share.jpg" className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all font-inter" />
                                        {ogImageUrl && <img src={ogImageUrl} alt="Preview" className="w-10 h-10 rounded border border-slate-200 object-cover" />}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1 font-inter uppercase tracking-tight">OG Title</label>
                                    <input value={ogTitle} onChange={e => setOgTitle(e.target.value)} placeholder={title || page.title} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all font-inter" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1 font-inter uppercase tracking-tight">OG Description</label>
                                    <textarea value={ogDescription} onChange={e => setOgDescription(e.target.value)} rows={3} placeholder={description || "Social description..."} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none font-inter" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end bg-slate-50/50">
                    <button onClick={onClose} disabled={saving} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-brand-600 text-white text-sm font-bold rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-all shadow-md shadow-brand-100 flex items-center gap-2 font-inter"
                    >
                        {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                        Save SEO Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

function copyToClipboard(text: string, onDone?: () => void) {
    navigator.clipboard.writeText(text).then(() => onDone && onDone());
}

// ──────────────────────────────────────────────
// API Keys Tab
// ──────────────────────────────────────────────
const ApiKeysTab: React.FC = () => {
    const { showSuccess, showError } = useFeedback();
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
        } catch { /* silent */ } finally { setLoading(false); }
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
                showError({ title: 'Creation Failed', message: res.error || 'Unable to create key.' });
            }
        } catch (e: any) {
            showError({ title: 'Error', message: e.message });
        } finally { setCreating(false); }
    };

    const handleDelete = async (id: string | number) => {
        if (!window.confirm('Delete this API key? This cannot be undone.')) return;
        try {
            const res = await cmsService.deleteApiKey(id);
            if (res.success) {
                setKeys(prev => prev.filter(k => k.id !== id));
                showSuccess({ title: 'Deleted', message: 'API Key removed.' });
            } else {
                showError({ title: 'Error', message: res.error || 'Delete failed.' });
            }
        } catch (e: any) { showError({ title: 'Error', message: e.message }); }
    };

    const handleToggle = async (id: string | number, currentActive: boolean | number) => {
        const next = !currentActive;
        try {
            const res = await cmsService.toggleApiKeyStatus(id, next);
            if (res.success) {
                setKeys(prev => prev.map(k => k.id === id ? { ...k, is_active: next } : k));
                showSuccess({ title: 'Updated', message: `Key status set to ${next ? 'active' : 'inactive'}.` });
            }
        } catch (e: any) { showError({ title: 'Error', message: e.message }); }
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

// ──────────────────────────────────────────────
// Menu Builder Tab
// ──────────────────────────────────────────────
const MenuBuilderTab: React.FC = () => {
    const { showSuccess, showError } = useFeedback();
    const [menus, setMenus] = useState<CMSMenu[]>([]);
    const [selectedMenu, setSelectedMenu] = useState<CMSMenu | null>(null);
    const [menuItems, setMenuItems] = useState<CMSMenuItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingItems, setLoadingItems] = useState(false);

    // New item form
    const [showAddItem, setShowAddItem] = useState(false);
    const [newLabel, setNewLabel] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newOrder, setNewOrder] = useState('');

    // Edit item form
    const [editingItem, setEditingItem] = useState<CMSMenuItem | null>(null);
    const [editLabel, setEditLabel] = useState('');
    const [editUrl, setEditUrl] = useState('');

    const loadMenus = useCallback(async () => {
        setLoading(true);
        try {
            const res = await cmsService.getCMSMenus();
            if (res.success) {
                const data = res.data;
                const arr: CMSMenu[] = Array.isArray(data) ? data : Object.values(data || {});
                setMenus(arr);

                // Initial selection based on URL
                const params = new URLSearchParams(window.location.search);
                const pageParam = params.get('page');
                if (pageParam) {
                    const target = arr.find(m => m.key === pageParam);
                    if (target) setSelectedMenu(target);
                    else if (arr.length > 0 && !selectedMenu) setSelectedMenu(arr[0]);
                } else if (arr.length > 0 && !selectedMenu) {
                    setSelectedMenu(arr[0]);
                }
            }
        } catch { } finally { setLoading(false); }
    }, [selectedMenu]);

    const loadMenuItems = useCallback(async (key: string) => {
        setLoadingItems(true);
        try {
            const res = await cmsService.getMenuWithItems(key);
            if (res.success && res.data) {
                setMenuItems(res.data.items || []);
            } else {
                setMenuItems([]);
            }
        } catch { setMenuItems([]); } finally { setLoadingItems(false); }
    }, []);

    useEffect(() => { loadMenus(); }, [loadMenus]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const pageParam = params.get('page');
        if (pageParam && menus.length > 0) {
            const target = menus.find(m => m.key === pageParam);
            if (target && target.id !== selectedMenu?.id) {
                setSelectedMenu(target);
            }
        }
    }, [location.search, menus, selectedMenu]);

    useEffect(() => {
        if (selectedMenu) loadMenuItems(selectedMenu.key);
    }, [selectedMenu, loadMenuItems]);

    const handleAddItem = async () => {
        if (!newLabel || !newUrl || !selectedMenu) return;
        try {
            const res = await cmsService.createMenuItem({
                menu_id: selectedMenu.id,
                label: newLabel,
                url: newUrl,
                order: newOrder ? parseInt(newOrder) : 0,
            });
            if (res.success) {
                showSuccess({ title: 'Item Added', message: `"${newLabel}" added to ${selectedMenu.name}` });
                setNewLabel(''); setNewUrl(''); setNewOrder('');
                setShowAddItem(false);
                await loadMenuItems(selectedMenu.key);
            } else {
                showError({ title: 'Error', message: res.error || 'Failed to add item.' });
            }
        } catch (e: any) { showError({ title: 'Error', message: e.message }); }
    };

    const handleUpdateItem = async () => {
        if (!editingItem) return;
        try {
            const res = await cmsService.updateMenuItem(editingItem.id, { label: editLabel, url: editUrl });
            if (res.success) {
                showSuccess({ title: 'Updated', message: 'Menu item updated.' });
                setEditingItem(null);
                if (selectedMenu) await loadMenuItems(selectedMenu.key);
            } else {
                showError({ title: 'Error', message: res.error || 'Update failed.' });
            }
        } catch (e: any) { showError({ title: 'Error', message: e.message }); }
    };

    const handleDeleteItem = async (id: string | number) => {
        if (!window.confirm('Delete this menu item?')) return;
        try {
            const res = await cmsService.deleteMenuItem(id);
            if (res.success) {
                setMenuItems(prev => prev.filter(i => i.id !== id));
                showSuccess({ title: 'Removed', message: 'Menu item removed.' });
            }
        } catch (e: any) { showError({ title: 'Error', message: e.message }); }
    };

    const handleToggleVisibility = async (item: CMSMenuItem) => {
        try {
            const next = !item.is_visible;
            const res = await cmsService.updateMenuItemVisibility(item.id, next);
            if (res.success) {
                setMenuItems(prev => prev.map(i => i.id === item.id ? { ...i, is_visible: next } : i));
            }
        } catch { }
    };

    return (
        <div className="p-6 space-y-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Navigation Menu Builder</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Edit header and footer navigation menus.</p>
                </div>
                <button onClick={loadMenus} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {loading ? (
                <div className="text-center text-slate-400 py-10">Loading menus...</div>
            ) : (
                <div className="grid grid-cols-3 gap-4 h-[calc(100vh-260px)]">
                    {/* Menu List */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-auto">
                        <div className="px-4 py-3 border-b border-slate-100">
                            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">All Menus</span>
                        </div>
                        {menus.length === 0 ? (
                            <div className="p-4 text-center text-slate-400 text-sm">No menus found</div>
                        ) : (
                            <ul className="p-2 space-y-1">
                                {menus.map(menu => (
                                    <li key={menu.id}>
                                        <button
                                            onClick={() => setSelectedMenu(menu)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${selectedMenu?.id === menu.id ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            <Globe size={15} className="opacity-70" />
                                            <span className="text-sm">{menu.name}</span>
                                            <span className="ml-auto text-xs font-mono text-slate-400">{menu.key}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Items Editor */}
                    <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                        {!selectedMenu ? (
                            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                                Select a menu to edit its items.
                            </div>
                        ) : (
                            <>
                                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-700">
                                        {selectedMenu.name} <span className="text-slate-400 font-normal text-xs">({menuItems.length} items)</span>
                                    </span>
                                    <button
                                        onClick={() => setShowAddItem(!showAddItem)}
                                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-semibold"
                                    >
                                        <Plus size={12} /> Add Item
                                    </button>
                                </div>

                                {/* Add Item Form */}
                                {showAddItem && (
                                    <div className="bg-brand-50 border-b border-brand-100 px-4 py-3 space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                value={newLabel}
                                                onChange={e => setNewLabel(e.target.value)}
                                                placeholder="Label (e.g. About Us)"
                                                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
                                            />
                                            <input
                                                value={newUrl}
                                                onChange={e => setNewUrl(e.target.value)}
                                                placeholder="URL (e.g. /about)"
                                                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
                                            />
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                value={newOrder}
                                                onChange={e => setNewOrder(e.target.value)}
                                                placeholder="Display order (optional)"
                                                type="number"
                                                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 w-40"
                                            />
                                            <button onClick={handleAddItem} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors">
                                                Add
                                            </button>
                                            <button onClick={() => setShowAddItem(false)} className="px-3 py-2 text-slate-500 hover:text-slate-700 text-sm">Cancel</button>
                                        </div>
                                    </div>
                                )}

                                {/* Items List */}
                                <div className="flex-1 overflow-auto">
                                    {loadingItems ? (
                                        <div className="p-8 text-center text-slate-400 text-sm">Loading items...</div>
                                    ) : menuItems.length === 0 ? (
                                        <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                                            <Menu size={28} className="text-slate-200" />
                                            No items in this menu yet.
                                        </div>
                                    ) : (
                                        <ul className="divide-y divide-slate-100">
                                            {menuItems.map(item => (
                                                <li key={item.id} className="px-4 py-3 group">
                                                    {editingItem?.id === item.id ? (
                                                        <div className="flex gap-2 items-center">
                                                            <input value={editLabel} onChange={e => setEditLabel(e.target.value)} placeholder="Label" title="Menu Item Label" className="flex-1 px-2 py-1.5 text-sm border border-brand-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-400" />
                                                            <input value={editUrl} onChange={e => setEditUrl(e.target.value)} placeholder="URL" title="Menu Item URL" className="flex-1 px-2 py-1.5 text-sm border border-brand-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-400" />
                                                            <button onClick={handleUpdateItem} className="px-3 py-1.5 bg-brand-600 text-white text-xs rounded-lg hover:bg-brand-700 font-semibold">Save</button>
                                                            <button onClick={() => setEditingItem(null)} title="Cancel" className="p-1.5 text-slate-400 hover:text-slate-600"><X size={14} /></button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                {item.is_visible !== false ? (
                                                                    <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                                                                ) : (
                                                                    <span className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0" />
                                                                )}
                                                                <div>
                                                                    <div className="text-sm font-medium text-slate-700">{item.label}</div>
                                                                    <div className="text-xs text-slate-400 font-mono">{item.url}</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => handleToggleVisibility(item)} title={item.is_visible !== false ? 'Hide' : 'Show'} className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-brand-50">
                                                                    {item.is_visible !== false ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                                                </button>
                                                                <button onClick={() => { setEditingItem(item); setEditLabel(item.label); setEditUrl(item.url); }} title="Edit Item" className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-brand-50">
                                                                    <Edit2 size={14} />
                                                                </button>
                                                                <button onClick={() => handleDeleteItem(item.id)} title="Delete Item" className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ──────────────────────────────────────────────
// Global Settings Tab
// ──────────────────────────────────────────────
const SettingsTab: React.FC<{ section?: string }> = ({ section = 'GlobalSEO' }) => {
    const { globalContent, updateGlobal, updatePMSContent } = useCMS();
    const { showSuccess, showError } = useFeedback();

    // ── Global SEO sub-section state ──
    const [siteName, setSiteName] = useState(globalContent.siteName || '');
    const [metaDesc, setMetaDesc] = useState(globalContent.metaDescription || '');
    const [metaKeys, setMetaKeys] = useState(globalContent.metaKeywords || '');
    const [seoTitle, setSeoTitle] = useState(globalContent.seoDefaults?.siteTitle || '');
    const [ogImage, setOgImage] = useState(globalContent.seoDefaults?.ogImage || '');
    const [saving, setSaving] = useState(false);

    // ── Footer / content sub-section state ──
    const [footerParsed, setFooterParsed] = useState<any>({});
    const [footerDirty, setFooterDirty] = useState(false);
    const [footerJsonError, setFooterJsonError] = useState<string | null>(null);
    const [loadingFooter, setLoadingFooter] = useState(false);

    // Slug map for footer/legal pages
    const sectionSlugMap: Record<string, string> = {
        FooterLayout: 'footer',
        PrivacyPolicy: 'privacy-policy',
        TermsOfService: 'terms-of-service',
    };

    // Sync SEO form when globalContent updates
    useEffect(() => {
        setSiteName(globalContent.siteName || '');
        setMetaDesc(globalContent.metaDescription || '');
        setMetaKeys(globalContent.metaKeywords || '');
        setSeoTitle(globalContent.seoDefaults?.siteTitle || '');
        setOgImage(globalContent.seoDefaults?.ogImage || '');
    }, [globalContent]);

    // Load page content for footer/legal sub-sections
    useEffect(() => {
        const slug = sectionSlugMap[section];
        if (!slug) return;
        setLoadingFooter(true);
        cmsService.getPageSections(slug)
            .then(res => {
                if (res.success) {
                    const d = res.data || {};
                    setFooterParsed(d);
                }
            })
            .catch(() => { })
            .finally(() => setLoadingFooter(false));
    }, [section]);

    const handleSaveSEO = async () => {
        setSaving(true);
        try {
            await updateGlobal('siteName', siteName);
            await updateGlobal('metaDescription', metaDesc);
            await updateGlobal('metaKeywords', metaKeys);
            await updateGlobal('seoDefaults', { ...globalContent.seoDefaults, siteTitle: seoTitle, ogImage });
            showSuccess({ title: 'Settings Saved', message: 'Global SEO defaults updated.' });
        } catch (e: any) {
            showError({ title: 'Save Failed', message: e.message });
        } finally { setSaving(false); }
    };

    const handleSaveFooterContent = async () => {
        const slug = sectionSlugMap[section];
        if (!slug || footerJsonError) return;
        setSaving(true);
        try {
            await updatePMSContent(slug, footerParsed);
            showSuccess({ title: 'Saved', message: 'Content updated successfully.' });
            setFooterDirty(false);
        } catch (e: any) {
            showError({ title: 'Save Failed', message: e.message });
        } finally { setSaving(false); }
    };

    // ── Footer/Legal sub-section view ──
    if (section !== 'GlobalSEO') {
        const pageLabel = section === 'FooterLayout' ? 'Footer Layout' : section === 'PrivacyPolicy' ? 'Privacy Policy' : 'Terms of Service';
        return (
            <div className="h-full flex flex-col bg-white">
                <div className="px-8 py-6 flex-shrink-0 border-b border-slate-100">
                    <h1 className="text-2xl font-bold text-slate-900">{pageLabel}</h1>
                    <p className="text-sm text-slate-500 mt-1">Edit content for the {pageLabel} section.</p>
                </div>
                <div className="flex-1 overflow-hidden flex flex-col px-8 pb-8 pt-6">
                    {loadingFooter ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400 gap-3">
                            <div className="w-8 h-8 border-4 border-slate-100 border-t-brand-600 rounded-full animate-spin" />
                            <p className="text-sm">Loading content...</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    {footerJsonError && (
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100">
                                            <AlertCircle size={12} /> JSON Error
                                        </span>
                                    )}
                                    {footerDirty && !footerJsonError && (
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100 animate-pulse">
                                            <AlertCircle size={12} /> Unsaved Changes
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={handleSaveFooterContent}
                                    disabled={!footerDirty || !!footerJsonError || saving}
                                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${!footerDirty || !!footerJsonError ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm'}`}
                                >
                                    {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                                    Publish Changes
                                </button>
                            </div>
                            <div className="flex-1 overflow-auto">
                                <div className="max-w-4xl mx-auto p-8">
                                    <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
                                        <DynamicJsonEditor
                                            data={footerParsed}
                                            onChange={(newData) => {
                                                setFooterParsed(newData);
                                                setFooterJson(JSON.stringify(newData, null, 2));
                                                setFooterDirty(true);
                                            }}
                                            label={section}
                                            level={0}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── Global SEO sub-section view ──
    return (
        <div className="h-full flex flex-col bg-slate-50 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto w-full space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Global Settings</h2>
                        <p className="text-slate-500 text-sm">Configure site-wide SEO defaults and core business information.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* SEO Card */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                                <Globe size={18} className="text-brand-600" />
                                <h3 className="font-bold text-slate-800">Global SEO Defaults</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1 tracking-tight">Default Site Name</label>
                                    <input value={siteName} onChange={e => setSiteName(e.target.value)} placeholder="Eleastar" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1 tracking-tight">Default Site Title</label>
                                    <input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="Eleastar - Innovative Tech Solutions" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1 tracking-tight">Default Meta Description</label>
                                    <textarea value={metaDesc} onChange={e => setMetaDesc(e.target.value)} rows={3} placeholder="Provide a site-wide fallback description..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1 tracking-tight">Global Keywords</label>
                                    <input value={metaKeys} onChange={e => setMetaKeys(e.target.value)} placeholder="ERP, Workforce, Innovation" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1 tracking-tight">Default OG / Share Image URL</label>
                                    <div className="flex gap-2">
                                        <input value={ogImage} onChange={e => setOgImage(e.target.value)} placeholder="https://eleastar.com/og-default.jpg" className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all" />
                                        {ogImage && <img src={ogImage} alt="OG Preview" className="w-10 h-10 rounded-lg border border-slate-200 object-cover flex-shrink-0" />}
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button
                                        onClick={handleSaveSEO}
                                        disabled={saving}
                                        className="px-6 py-2 bg-brand-600 text-white text-sm font-bold rounded-lg hover:bg-brand-700 transition-all flex items-center gap-2 shadow-sm"
                                    >
                                        {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                                        Save Default SEO
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Search Preview */}
                        <div className="bg-brand-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <AlertCircle size={80} />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-lg font-bold mb-2">SEO Tip</h4>
                                <p className="text-brand-100 text-sm leading-relaxed mb-4">
                                    Individual page settings will ALWAYS override these defaults. Use this section for content that should appear when a specific page hasn't been configured yet.
                                </p>
                                <div className="bg-white/10 rounded-lg p-3 text-xs font-mono">
                                    {seoTitle || siteName || 'Eleastar'} | Page Title
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Info Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Layout size={18} /> Asset Defaults</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between group cursor-pointer">
                                    <span className="text-sm text-slate-600">Favicon</span>
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 transition-all">
                                        <Edit2 size={16} />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between group cursor-pointer">
                                    <span className="text-sm text-slate-600">Site Logo</span>
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 transition-all">
                                        <Edit2 size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Globe size={18} /> Quick Links</h4>
                            <div className="space-y-2 text-xs font-medium text-slate-500">
                                <a href="/admin/cms?module=settings&page=FooterLayout" className="block hover:text-brand-600 transition-colors">→ Footer Layout</a>
                                <a href="/admin/cms?module=settings&page=PrivacyPolicy" className="block hover:text-brand-600 transition-colors">→ Privacy Policy</a>
                                <a href="/admin/cms?module=settings&page=TermsOfService" className="block hover:text-brand-600 transition-colors">→ Terms of Service</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ──────────────────────────────────────────────
// Pages Manager Tab
// ──────────────────────────────────────────────
const PagesTab: React.FC = () => {
    const { updatePMSContent, createCMSPage, deleteCMSPage, updateCMSPageStatus, updateSEOMetadata } = useCMS();
    const { showSuccess, showError } = useFeedback();

    const [pages, setPages] = useState<CMSPageItem[]>([]);
    const [selectedPage, setSelectedPage] = useState<CMSPageItem | null>(null);
    const [loadingSections, setLoadingSections] = useState(false);
    const [activeView, setActiveView] = useState<'editor' | 'preview' | 'json'>('editor');
    const [jsonInput, setJsonInput] = useState('{}');
    const [parsedData, setParsedData] = useState<any>({});
    const [isDirty, setIsDirty] = useState(false);
    const [jsonError, setJsonError] = useState<string | null>(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSEOModal, setShowSEOModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newSlug, setNewSlug] = useState('');

    const PREVIEW_URL = PUBLIC_LINK || window.location.origin;

    const loadPages = useCallback(async () => {
        try {
            const res = await cmsService.getCMSPages();
            if (res.success && res.data) {
                const raw = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
                setPages(raw);
            }
        } catch { }
    }, []);

    const loadSections = useCallback(async (slug: string) => {
        setLoadingSections(true);
        try {
            const res = await cmsService.getPageSections(slug);
            if (res.success) {
                const sectionData = res.data;
                const jsonStr = JSON.stringify(sectionData, null, 2);
                setJsonInput(jsonStr);
                setParsedData(sectionData);
            }
        } catch { } finally { setLoadingSections(false); }
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const pageParam = params.get('page');
        if (pageParam && pages.length > 0) {
            const target = pages.find(p => p.slug === pageParam);
            if (target && target.slug !== selectedPage?.slug) {
                setSelectedPage(target);
            }
        } else if (!pageParam && selectedPage) {
            setSelectedPage(null);
        }
    }, [location.search, pages, selectedPage]);

    useEffect(() => { loadPages(); }, [loadPages]);

    useEffect(() => {
        if (selectedPage) loadSections(selectedPage.slug);
    }, [selectedPage, loadSections]);

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setJsonInput(e.target.value);
        setIsDirty(true);
        setJsonError(null);
        try {
            setParsedData(JSON.parse(e.target.value));
        } catch (err: any) { setJsonError(err.message); }
    };

    const handleDynamicChange = (newData: any) => {
        setParsedData(newData);
        setJsonInput(JSON.stringify(newData, null, 2));
        setIsDirty(true);
        setJsonError(null);
    };

    const handleSave = async () => {
        if (!selectedPage || jsonError) return;
        try {
            await updatePMSContent(selectedPage.slug, parsedData);
            showSuccess({ title: 'Published', message: `${selectedPage.title} changes are now live.` });
            setIsDirty(false);
        } catch (e: any) { showError({ title: 'Publish Failed', message: e.message }); }
    };

    const handleCreate = async () => {
        if (!newTitle || !newSlug) return;
        try {
            const res = await createCMSPage({ title: newTitle, slug: newSlug.toLowerCase().replace(/\s+/g, '-') });
            if (res.success) {
                setShowCreateModal(false); setNewTitle(''); setNewSlug('');
                await loadPages();
                showSuccess({ title: 'Page Created', message: `Page "${newTitle}" has been added.` });
            } else {
                showError({ title: 'Creation Failed', message: res.error || 'Unable to create page.' });
            }
        } catch (e: any) { showError({ title: 'Error', message: e.message }); }
    };

    const handleDelete = async (slug: string) => {
        if (!window.confirm(`Delete page "${slug}"? This cannot be undone.`)) return;
        try {
            const res = await deleteCMSPage(slug);
            if (res.success) {
                setPages(prev => prev.filter(p => p.slug !== slug));
                if (selectedPage?.slug === slug) setSelectedPage(null);
                showSuccess({ title: 'Deleted', message: `Page removed.` });
            }
        } catch (e: any) { showError({ title: 'Error', message: e.message }); }
    };

    const handleToggleStatus = async (page: CMSPageItem) => {
        const next = page.status === 'live' ? 'draft' : 'live';
        try {
            const res = await updateCMSPageStatus(page.slug, next);
            if (res.success) {
                setPages(prev => prev.map(p => p.slug === page.slug ? { ...p, status: next } : p));
                showSuccess({ title: 'Status Updated', message: `Page set to ${next}.` });
            }
        } catch (e: any) { showError({ title: 'Error', message: e.message }); }
    };

    const handleSaveSEO = async (payload: any) => {
        if (!selectedPage) return;
        try {
            const res = await updateSEOMetadata(selectedPage.slug, payload);
            if (res.success) {
                showSuccess({ title: 'SEO Updated', message: 'Metadata has been saved successfully.' });
                await loadPages(); // Refresh the list to get new SEO values
            }
        } catch (e: any) {
            showError({ title: 'SEO Save Failed', message: e.message });
        }
    };

    const extractPreviewUrl = () => {
        if (!selectedPage) return PREVIEW_URL;
        const slug = selectedPage.slug;
        if (slug === 'home') return PREVIEW_URL;
        return `${PREVIEW_URL}/${slug}`;
    };

    const isServicesPage = selectedPage?.slug === 'services' ||
        ['information-technology', 'research-and-development', 'electronics-manufacturing', 'cloud-solutions'].includes(selectedPage?.slug || '');

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Website CMS Header */}
            <div className="px-8 py-6 flex-shrink-0">
                <div className="flex items-center justify-between mb-1">
                    <h1 className="text-2xl font-bold text-slate-900">Website CMS</h1>
                </div>
                <p className="text-sm text-slate-500">Manage your public-facing website content from one place.</p>
            </div>

            {/* Content Editor Area */}
            <div className="flex-1 flex flex-col overflow-hidden px-8 pb-8">
                {/* Editor Tabs row */}
                <div className="flex items-center gap-12 border-b border-slate-100 mb-6">
                    {(['editor', 'json', 'preview'] as const).map(v => (
                        <button
                            key={v}
                            onClick={() => setActiveView(v)}
                            className={`flex items-center gap-2 py-4 text-sm font-medium transition-all relative ${activeView === v ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {v === 'editor' ? <Layout size={18} /> : v === 'json' ? <FileCode size={18} /> : <Eye size={18} />}
                            {v === 'editor' ? 'Visual Editor' : v === 'json' ? 'Json Syntax' : 'Preview'}
                            {activeView === v && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />}
                        </button>
                    ))}
                </div>

                {!selectedPage ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3 border-2 border-dashed border-slate-100 rounded-2xl">
                        <FolderOpen size={48} className="text-slate-100" />
                        <p className="text-base font-medium">Select a page from the sidebar to start editing</p>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Action Bar */}
                        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleToggleStatus(selectedPage)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all font-inter"
                                >
                                    {selectedPage.status === 'live' ? <EyeOff size={18} className="text-slate-500" /> : <Eye size={18} className="text-slate-500" />}
                                    {selectedPage.status === 'live' ? 'Hide' : 'Show'}
                                </button>

                                <button
                                    onClick={() => handleDelete(selectedPage!.slug)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border border-red-100 text-red-600 hover:bg-red-50 transition-all font-inter"
                                >
                                    <Trash2 size={18} /> Delete
                                </button>

                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border border-brand-100 text-brand-600 hover:bg-brand-50 transition-all font-inter"
                                >
                                    <Plus size={18} /> Add New Page
                                </button>

                                <button
                                    onClick={() => setShowSEOModal(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border border-brand-100 text-brand-600 hover:bg-brand-50 transition-all font-inter"
                                >
                                    <Globe size={18} /> SEO Settings
                                </button>

                                {isServicesPage && (
                                    <button
                                        onClick={() => {
                                            const newSections = { ...parsedData, [`section_${Date.now()}`]: { title: 'New Section', content: '' } };
                                            handleDynamicChange(newSections);
                                            showSuccess({ title: 'Section Added', message: 'A new section has been added to the editor.' });
                                        }}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border border-brand-100 text-brand-600 hover:bg-brand-50 transition-all font-inter"
                                    >
                                        <PlusCircle size={18} /> Add New Section
                                    </button>
                                )}

                                <div className="w-px h-8 bg-slate-100 mx-2" />

                                <button
                                    onClick={handleSave}
                                    disabled={!isDirty || !!jsonError}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md font-inter ${!isDirty || !!jsonError ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-100'}`}
                                >
                                    <Save size={18} /> Publish Changes
                                </button>
                            </div>

                            {/* Status Indicators */}
                            <div className="flex items-center gap-4">
                                {isDirty && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100 animate-pulse">
                                        <AlertCircle size={14} /> Unsaved Changes
                                    </span>
                                )}
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${selectedPage.status === 'live' ? 'bg-green-500' : 'bg-slate-400'}`} />
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{selectedPage.status || 'draft'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Editor Content */}
                        <div className="flex-1 overflow-auto bg-slate-50/20">
                            {activeView === 'editor' && (
                                <div className="max-w-4xl mx-auto p-12">
                                    {loadingSections ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                                            <div className="w-10 h-10 border-4 border-slate-100 border-t-brand-600 rounded-full animate-spin" />
                                            <p className="text-sm font-medium">Loading Page Content...</p>
                                        </div>
                                    ) : (
                                        <div className="bg-white border border-slate-100 rounded-2xl p-10 shadow-sm shadow-slate-200/50">
                                            <DynamicJsonEditor
                                                data={parsedData}
                                                onChange={handleDynamicChange}
                                                label={selectedPage.slug}
                                                level={0}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeView === 'json' && (
                                <div className="h-full bg-[#1e1e1e]">
                                    <textarea
                                        title="JSON content"
                                        value={jsonInput}
                                        onChange={handleJsonChange}
                                        className="w-full h-full p-8 font-mono text-sm leading-relaxed resize-none bg-transparent text-slate-300 focus:outline-none"
                                        spellCheck={false}
                                    />
                                </div>
                            )}
                            {activeView === 'preview' && (
                                <div className="h-full">
                                    <CMSPreviewPane url={extractPreviewUrl()} cmsContent={parsedData} pageName={selectedPage?.slug || ''} />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Create Page Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Create New Page</h3>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100" title="Close">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Page Title</label>
                                <input value={newTitle} onChange={e => { setNewTitle(e.target.value); setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')); }}
                                    placeholder="e.g. Technology" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                                <div className="flex">
                                    <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg text-sm text-slate-500">/</span>
                                    <input value={newSlug} onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                                        placeholder="technology" className="flex-1 px-3 py-2 border border-slate-200 rounded-r-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 font-medium">Cancel</button>
                            <button onClick={handleCreate} disabled={!newTitle || !newSlug}
                                className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                Create Page
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SEO Settings Modal */}
            {showSEOModal && selectedPage && (
                <SEOSettingsModal
                    page={selectedPage}
                    onClose={() => setShowSEOModal(false)}
                    onSave={handleSaveSEO}
                />
            )}
        </div>
    );
};


// ──────────────────────────────────────────────
// Main CMS Page
// ──────────────────────────────────────────────
export const CMSPage: React.FC = () => {
    const location = useLocation();
    const [activeModule, setActiveModule] = useState<CMSModule>('pages');

    // Map URL params to modules
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const mod = params.get('module') as CMSModule | null;
        if (mod && ['pages', 'menus', 'apikeys', 'settings'].includes(mod)) {
            setActiveModule(mod);
        }
    }, [location.search]);

    const params = new URLSearchParams(location.search);
    const pageParam = params.get('page') || 'GlobalSEO';

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
            {/* Module Content */}
            <div className="flex-1 overflow-hidden bg-slate-50/50">
                {activeModule === 'pages' && <PagesTab />}
                {activeModule === 'menus' && <MenuBuilderTab />}
                {activeModule === 'apikeys' && <ApiKeysTab />}
                {activeModule === 'settings' && <SettingsTab section={pageParam} />}
            </div>
        </div>
    );
};
