import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useCMS } from '../../context/CMSContext';
import { useFeedback } from '../../context/FeedbackContext';
import {
    Save, AlertCircle, CheckCircle, Eye, Layout, FileCode, Plus, X,
    ExternalLink, ChevronRight, ChevronDown, ToggleLeft, ToggleRight,
    Trash2, Download, Key, Globe, FolderOpen, Menu,
    EyeOff, PlusCircle, RefreshCw, Copy, Edit2, FileText, Lock
} from 'lucide-react';
import { DynamicJsonEditor } from '../../components/DynamicJsonEditor';
import { CMSPreviewPane } from '../../components/CMSPreviewPane';
import { PUBLIC_LINK } from '../../config';
import { cmsService } from '../../services/cmsService';

// ──────────────────────────────────────────────
// Sub-module types
// ──────────────────────────────────────────────
type CMSModule = 'pages' | 'menus' | 'apikeys';

interface CMSApiKey {
    id: string | number;
    name: string;
    key?: string;
    is_active: boolean | number;
    created_at?: string;
}

interface CMSMenuItem {
    id: string | number;
    label: string;
    url: string;
    order?: number;
    is_visible?: boolean;
    parent_id?: string | number | null;
    children?: CMSMenuItem[];
}

interface CMSMenu {
    id: string | number;
    name: string;
    key: string;
    items?: CMSMenuItem[];
}

interface CMSPageItem {
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
                        <Lock size={32} className="text-slate-300" />
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
// Pages Manager Tab
// ──────────────────────────────────────────────
const PagesTab: React.FC = () => {
    const { updatePMSContent, createCMSPage, deleteCMSPage, updateCMSPageStatus } = useCMS();
    const { showSuccess, showError } = useFeedback();

    const [pages, setPages] = useState<CMSPageItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPage, setSelectedPage] = useState<CMSPageItem | null>(null);
    const [loadingSections, setLoadingSections] = useState(false);
    const [activeView, setActiveView] = useState<'editor' | 'preview' | 'json'>('editor');
    const [jsonInput, setJsonInput] = useState('{}');
    const [parsedData, setParsedData] = useState<any>({});
    const [isDirty, setIsDirty] = useState(false);
    const [jsonError, setJsonError] = useState<string | null>(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newSlug, setNewSlug] = useState('');
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ services: true, technologies: true });

    // Hierarchy Configuration
    const HIERARCHY = {
        services: ['information-technology', 'research-and-development', 'electronics-manufacturing', 'cloud-solutions'],
        technologies: ['technology'] // Add others as they appear
    };

    const TOP_LEVEL_ORDER = ['home', 'services', 'technologies', 'eleastar-and-you', 'about-eleastar', 'contact-us'];

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const PREVIEW_URL = PUBLIC_LINK || window.location.origin;

    const loadPages = useCallback(async () => {
        setLoading(true);
        try {
            const res = await cmsService.getCMSPages();
            if (res.success && res.data) {
                const raw = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
                setPages(raw);

                // Initial deep-link selection
                const params = new URLSearchParams(window.location.search);
                const pageParam = params.get('page');
                if (pageParam && !selectedPage) {
                    const target = raw.find((p: any) => p.slug === pageParam);
                    if (target) setSelectedPage(target);
                }
            }
        } catch { } finally { setLoading(false); }
    }, [selectedPage]);

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
        }
    }, [location.search, pages, selectedPage]);

    useEffect(() => { loadPages(); }, [loadPages]);

    useEffect(() => {
        if (selectedPage) loadSections(selectedPage.slug);
    }, [selectedPage, loadSections]);

    const handleSelectPage = (page: CMSPageItem) => {
        setSelectedPage(page);
        setIsDirty(false);
        setJsonError(null);
    };

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
            showSuccess({ title: 'Saved', message: `${selectedPage.title} sections updated.` });
            setIsDirty(false);
        } catch (e: any) { showError({ title: 'Save Failed', message: e.message }); }
    };

    const handleCreate = async () => {
        if (!newTitle || !newSlug) return;
        try {
            await createCMSPage({ title: newTitle, slug: newSlug.toLowerCase().replace(/\s+/g, '-') });
            setShowCreateModal(false); setNewTitle(''); setNewSlug('');
            await loadPages();
        } catch { }
    };

    const handleDelete = async (slug: string) => {
        if (!window.confirm(`Delete page "${slug}"? This cannot be undone.`)) return;
        try {
            await deleteCMSPage(slug);
            setPages(prev => prev.filter(p => p.slug !== slug));
            if (selectedPage?.slug === slug) setSelectedPage(null);
            showSuccess({ title: 'Deleted', message: `Page removed.` });
        } catch (e: any) { showError({ title: 'Error', message: e.message }); }
    };

    const handleToggleStatus = async (page: CMSPageItem) => {
        const next = page.status === 'live' ? 'draft' : 'live';
        try {
            await updateCMSPageStatus(page.slug, next);
            setPages(prev => prev.map(p => p.slug === page.slug ? { ...p, status: next } : p));
            showSuccess({ title: 'Status Updated', message: `Page set to ${next}.` });
        } catch (e: any) { showError({ title: 'Error', message: e.message }); }
    };

    const extractPreviewUrl = () => {
        if (!selectedPage) return PREVIEW_URL;
        const slug = selectedPage.slug;
        if (slug === 'home') return PREVIEW_URL;
        return `${PREVIEW_URL}/${slug}`;
    };

    return (
        <div className="flex h-[calc(100vh-200px)]">
            {/* Page List Sidebar */}
            <div className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Pages</span>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 transition-colors"
                        title="New Page"
                    >
                        <Plus size={12} />
                    </button>
                </div>
                {loading ? (
                    <div className="p-4 text-center text-slate-400 text-sm">Loading...</div>
                ) : (
                    <div className="flex-1 overflow-auto p-2 space-y-0.5">
                        {TOP_LEVEL_ORDER.map(slug => {
                            const page = pages.find(p => p.slug === slug);
                            const isParent = HIERARCHY[slug as keyof typeof HIERARCHY];
                            const isExpanded = expandedGroups[slug];

                            if (!page && !isParent) return null;

                            return (
                                <div key={slug} className="space-y-0.5">
                                    {/* Top Level Item */}
                                    <div
                                        className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${selectedPage?.slug === slug ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                        onClick={() => page && handleSelectPage(page)}
                                    >
                                        {isParent ? (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleGroup(slug); }}
                                                className="p-0.5 hover:bg-slate-200 rounded transition-colors"
                                            >
                                                <ChevronRight size={14} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                            </button>
                                        ) : (
                                            <FileText size={14} className="flex-shrink-0 opacity-60 ml-0.5" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate capitalize">{page?.title || slug.replace(/-/g, ' ')}</div>
                                        </div>
                                    </div>

                                    {/* Children (Dropdown) */}
                                    {isParent && isExpanded && (
                                        <div className="ml-6 space-y-0.5 border-l border-slate-100 pl-2">
                                            {HIERARCHY[slug as keyof typeof HIERARCHY].map(childSlug => {
                                                const childPage = pages.find(p => p.slug === childSlug);
                                                if (!childPage) return null;
                                                return (
                                                    <div
                                                        key={childSlug}
                                                        className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${selectedPage?.slug === childSlug ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                                                        onClick={() => handleSelectPage(childPage)}
                                                    >
                                                        <FileText size={12} className="flex-shrink-0 opacity-40" />
                                                        <div className="text-xs font-medium truncate capitalize">{childPage.title}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Uncategorized Pages */}
                        {pages.filter(p => !TOP_LEVEL_ORDER.includes(p.slug) && !Object.values(HIERARCHY).flat().includes(p.slug)).map(page => (
                            <div
                                key={page.slug}
                                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${selectedPage?.slug === page.slug ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                onClick={() => handleSelectPage(page)}
                            >
                                <FileText size={14} className="flex-shrink-0 opacity-60 ml-5" />
                                <div className="text-sm font-medium truncate capitalize">{page.title}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Page Content Editor */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {!selectedPage ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
                        <FolderOpen size={36} className="text-slate-200" />
                        <p className="text-sm">Select a page to edit its sections.</p>
                        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-1.5 text-sm px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-semibold">
                            <Plus size={14} /> Create First Page
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Toolbar */}
                        <div className="flex gap-0 border-b border-slate-200 bg-slate-50 flex-shrink-0">
                            {(['editor', 'json', 'preview'] as const).map(v => (
                                <button key={v} onClick={() => setActiveView(v)}
                                    className={`flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors capitalize ${activeView === v ? 'bg-white text-brand-600 border-t-2 border-t-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
                                    {v === 'editor' ? <Layout size={14} /> : v === 'json' ? <FileCode size={14} /> : <Eye size={14} />}
                                    {v === 'editor' ? 'Visual Editor' : v === 'json' ? 'JSON Syntax' : 'Preview'}
                                </button>
                            ))}
                        </div>

                        {/* Status bar & Actions */}
                        <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col">
                                    <h2 className="text-sm font-bold text-slate-800 capitalize leading-tight">
                                        {selectedPage.title}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${selectedPage.status === 'live' ? 'text-green-600' : 'text-slate-400'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${selectedPage.status === 'live' ? 'bg-green-500' : 'bg-slate-300'}`} />
                                            {selectedPage.status || 'draft'}
                                        </span>
                                        {isDirty && !jsonError && (
                                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                                                <AlertCircle size={10} /> Unsaved
                                            </span>
                                        )}
                                        {jsonError && (
                                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1">
                                                <AlertCircle size={10} /> Schema Error
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Hide/Show Page */}
                                <button
                                    onClick={() => handleToggleStatus(selectedPage)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedPage.status === 'live' ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50' : 'bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100'}`}
                                >
                                    {selectedPage.status === 'live' ? <EyeOff size={14} /> : <Eye size={14} />}
                                    {selectedPage.status === 'live' ? 'Hide' : 'Show'}
                                </button>

                                {/* Delete Page */}
                                <button
                                    onClick={() => handleDelete(selectedPage.slug)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 border border-red-100 hover:bg-red-50 transition-all"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>

                                <div className="w-px h-6 bg-slate-200 mx-1" />

                                {/* Add New Section (Conditional) */}
                                {(selectedPage.slug === 'services' || HIERARCHY.services.includes(selectedPage.slug)) && (
                                    <button
                                        onClick={() => {
                                            // Feature to add a new section to the JSON model
                                            const newSections = { ...parsedData, [`section_${Date.now()}`]: { title: 'New Section', content: '' } };
                                            handleDynamicChange(newSections);
                                            showSuccess({ title: 'Section Added', message: 'A new section has been added to the editor.' });
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-xs font-bold border border-brand-200 hover:bg-brand-100 transition-all"
                                    >
                                        <PlusCircle size={14} /> New Section
                                    </button>
                                )}

                                {/* Add New Page */}
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 transition-all shadow-sm shadow-brand-200"
                                >
                                    <Plus size={14} /> New Page
                                </button>

                                <div className="w-px h-6 bg-slate-200 mx-1" />

                                {/* Save Button */}
                                <button
                                    onClick={handleSave}
                                    disabled={!isDirty || !!jsonError}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all ${!isDirty || !!jsonError ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 shadow-sm shadow-green-200'}`}
                                >
                                    <Save size={14} /> Save Changes
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-auto bg-slate-50/30">
                            {activeView === 'editor' && (
                                <div className="max-w-3xl mx-auto p-6">
                                    {loadingSections ? (
                                        <div className="text-center text-slate-400 text-sm py-10">Loading sections...</div>
                                    ) : (
                                        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-left">
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
                                <textarea
                                    value={jsonInput}
                                    onChange={handleJsonChange}
                                    className={`w-full h-full p-6 font-mono text-sm leading-relaxed resize-none focus:outline-none ${jsonError ? 'bg-red-50/30 text-red-900' : 'bg-transparent text-slate-800'}`}
                                    spellCheck={false}
                                    placeholder="Page sections JSON..."
                                />
                            )}
                            {activeView === 'preview' && (
                                <CMSPreviewPane url={extractPreviewUrl()} cmsContent={parsedData} pageName={selectedPage?.slug || ''} />
                            )}
                        </div>
                    </>
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
        if (mod && ['pages', 'menus', 'apikeys'].includes(mod)) {
            setActiveModule(mod);
        }
    }, [location.search]);

    const tabs: { id: CMSModule; label: string; icon: React.ReactNode; description: string }[] = [
        { id: 'pages', label: 'Pages', icon: <FileText size={16} />, description: 'Manage website pages and their section content.' },
        { id: 'menus', label: 'Navigation', icon: <Globe size={16} />, description: 'Build and edit header & footer menus.' },
        { id: 'apikeys', label: 'API Keys', icon: <Key size={16} />, description: 'Generate and manage public CMS access keys.' },
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
            {/* Module Switcher Header */}
            <div className="bg-white border-b border-slate-200 px-6 pt-5 flex-shrink-0">
                <h1 className="text-2xl font-extrabold text-slate-800 mb-1">Website CMS</h1>
                <p className="text-sm text-slate-500 mb-4">Manage your public-facing website content from one place.</p>
                <div className="flex gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveModule(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-semibold border-b-2 transition-all ${activeModule === tab.id ? 'bg-white border-brand-600 text-brand-700' : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'}`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Module Content */}
            <div className="flex-1 overflow-hidden bg-slate-50/50">
                {activeModule === 'pages' && <PagesTab />}
                {activeModule === 'menus' && <MenuBuilderTab />}
                {activeModule === 'apikeys' && <ApiKeysTab />}
            </div>
        </div>
    );
};
