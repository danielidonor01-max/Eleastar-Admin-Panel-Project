import { toast } from "sonner";
import { cmsService } from "@/services/cmsService";
import type { CMSMenu, CMSMenuItem } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Globe, Plus, ToggleRight, ToggleLeft, Edit2, Trash2, Menu, X } from "lucide-react";

const MenuBuilderTab = () => {
    
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
        } catch { 
            toast.error('Error', { description: 'Failed to load menus.' });
        } finally { setLoading(false); }
    }, [selectedMenu]);

    const loadMenuItems = useCallback(async (key: string) => {
        setLoadingItems(true);
        try {
            const res = await cmsService.getMenuWithItems(key);
            if (res.success && res.data) {
                setMenuItems(res.data as CMSMenuItem[]);
            } else {
                setMenuItems([]);
            }
        } catch { 
            toast.error('Error', { description: 'Failed to load menu items.' });
            setMenuItems([]); 
        } finally { setLoadingItems(false); }
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
    }, [menus, selectedMenu]);

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
                toast.success('Item Added', { description: `"${newLabel}" added to ${selectedMenu.name}` });
                setNewLabel(''); setNewUrl(''); setNewOrder('');
                setShowAddItem(false);
                await loadMenuItems(selectedMenu.key);
            } else {
                toast.error('Error', { description: res.error || 'Failed to add item.' });
            }
        } catch (e: unknown) { toast.error('Error', { description: e instanceof Error ? e.message : 'Unknown error' }); }
    };

    const handleUpdateItem = async () => {
        if (!editingItem) return;
        try {
            const res = await cmsService.updateMenuItem(editingItem.id, { label: editLabel, url: editUrl });
            if (res.success) {
                toast.success('Updated', { description: 'Menu item updated.' });
                setEditingItem(null);
                if (selectedMenu) await loadMenuItems(selectedMenu.key);
            } else {
                toast.error('Error', { description: res.error || 'Update failed.' });
            }
        } catch (e: unknown) { toast.error('Error', { description: e instanceof Error ? e.message : 'Unknown error' }); }
    };

    const handleDeleteItem = async (id: string | number) => {
        if (!window.confirm('Delete this menu item?')) return;
        try {
            const res = await cmsService.deleteMenuItem(id);
            if (res.success) {
                setMenuItems(prev => prev.filter(i => i.id !== id));
                toast.success('Removed', { description: 'Menu item removed.' });
            }
        } catch (e: unknown) { toast.error('Error', { description: e instanceof Error ? e.message : 'Unknown error' }); }
    };

    const handleToggleVisibility = async (item: CMSMenuItem) => {
        try {
            const next = !item.is_visible;
            const res = await cmsService.updateMenuItemVisibility(item.id, next);
            if (res.success) {
                setMenuItems(prev => prev.map(i => i.id === item.id ? { ...i, is_visible: next } : i));
            }
        } catch { 
            toast.error('Error', { description: 'Failed to toggle visibility.' });
        }
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
                                                                    <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                                                                ) : (
                                                                    <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
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
export default MenuBuilderTab;

