// ──────────────────────────────────────────────
// Pages Manager Tab

import { DynamicJsonEditor } from "@/components/DynamicJsonEditor";
import { CMSPreviewPane } from "@/components/CMSPreviewPane";
import { useCallback, useEffect, useState } from "react";
import { cmsService } from "@/services/cmsService";
import type { CMSPageItem } from "@/types";

import { PUBLIC_LINK } from "@/config";
import { Globe, Layout, FileCode, Eye, FolderOpen, Trash2, Plus, PlusCircle, AlertCircle, RefreshCw, Save, X, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useCMSStore } from "@/stores/useCMSStore";

// ──────────────────────────────────────────────
const PagesTab = () => {
    const updatePMSContent = useCMSStore((s) => s.updatePMSContent);
    const createCMSPage = useCMSStore((s) => s.createCMSPage);
    const deleteCMSPage = useCMSStore((s) => s.deleteCMSPage);
    const updateCMSPageStatus = useCMSStore((s) => s.updateCMSPageStatus);
    const updateSEOMetadata = useCMSStore((s) => s.updateSEOMetadata);
    

    const [pages, setPages] = useState<CMSPageItem[]>([]);
    const [selectedPage, setSelectedPage] = useState<CMSPageItem | null>(null);
    const [loadingSections, setLoadingSections] = useState(false);
    const [activeView, setActiveView] = useState<'content' | 'seo' | 'preview' | 'json'>('content');
    const [jsonInput, setJsonInput] = useState('{}');
    const [parsedData, setParsedData] = useState<Record<string, unknown>>({});
    const [isDirty, setIsDirty] = useState(false);
    const [jsonError, setJsonError] = useState<string | null>(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newSlug, setNewSlug] = useState('');

    const PREVIEW_URL = PUBLIC_LINK || window.location.origin;

    const loadPages = useCallback(async () => {
        try {
            const res = await cmsService.getCMSPages();
            if (res.success && res.data) {
                const raw = Array.isArray(res.data) ? res.data : (res.data as unknown as Record<string, unknown>)?.data || [];
                setPages(raw as CMSPageItem[]);
            }
        } catch { 
            toast.error('Error', { description: 'Failed to load pages.' });
        }
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
        } catch { 
            toast.error('Error', { description: 'Failed to load sections.' });
        } finally { setLoadingSections(false); }
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
    }, [pages, selectedPage]);

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
        } catch (err: unknown) { setJsonError(err instanceof Error ? err.message : 'Unknown error'); }
    };

    const handleDynamicChange = (newData: Record<string, unknown>) => {
        setParsedData(newData);
        setJsonInput(JSON.stringify(newData, null, 2));
        setIsDirty(true);
        setJsonError(null);
    };

    const handleSave = async () => {
        if (!selectedPage || jsonError) return;
        try {
            await updatePMSContent(selectedPage.slug, parsedData);
            toast.success('Published', { description: `${selectedPage.title} changes are now live.` });
            setIsDirty(false);
        } catch (e: unknown) { toast.error('Publish Failed', { description: e instanceof Error ? e.message : 'Unknown error' }); }
    };

    const handleCreate = async () => {
        if (!newTitle || !newSlug) return;
        try {
            const res = await createCMSPage({ title: newTitle, slug: newSlug.toLowerCase().replace(/\s+/g, '-') });
            if (res.success) {
                setShowCreateModal(false); setNewTitle(''); setNewSlug('');
                await loadPages();
                toast.success('Page Created', { description: `Page "${newTitle}" has been added.` });
            } else {
                toast.error('Creation Failed', { description: res.error || 'Unable to create page.' });
            }
        } catch (e: unknown) { toast.error('Error', { description: e instanceof Error ? e.message : 'Unknown error' }); }
    };

    const handleDelete = async (slug: string) => {
        if (!window.confirm(`Delete page "${slug}"? This cannot be undone.`)) return;
        try {
            const res = await deleteCMSPage(slug);
            if (res.success) {
                setPages(prev => prev.filter(p => p.slug !== slug));
                if (selectedPage?.slug === slug) setSelectedPage(null);
                toast.success('Deleted', { description: `Page removed.` });
            }
        } catch (e: unknown) { toast.error('Error', { description: e instanceof Error ? e.message : 'Unknown error' }); }
    };

    const handleToggleStatus = async (page: CMSPageItem) => {
        const next = page.status === 'live' ? 'draft' : 'live';
        try {
            const res = await updateCMSPageStatus(page.slug, next);
            if (res.success) {
                setPages(prev => prev.map(p => p.slug === page.slug ? { ...p, status: next } : p));
                toast.success('Status Updated', { description: `Page set to ${next}.` });
            }
        } catch (e: unknown) { toast.error('Error', { description: e instanceof Error ? e.message : 'Unknown error' }); }
    };

    const handleSaveSEO = async (payload: Record<string, unknown>) => {
        if (!selectedPage) return;
        try {
            const res = await updateSEOMetadata(selectedPage.slug, payload);
            if (res.success) {
                toast.success('SEO Updated', { description: 'Metadata has been saved successfully.' });
                await loadPages(); // Refresh the list to get new SEO values
            }
        } catch (e: unknown) {
            toast.error('SEO Save Failed', { description: e instanceof Error ? e.message : 'Unknown error' });
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
            <div className="px-8 py-6 shrink-0">
                <div className="flex items-center justify-between mb-1">
                    <h1 className="text-2xl font-bold text-slate-900">Website CMS</h1>
                </div>
                <p className="text-sm text-slate-500">Manage your public-facing website content from one place.</p>
            </div>

            {/* Content Editor Area */}
            <div className="flex-1 flex flex-col overflow-hidden px-8 pb-8">
                {/* Editor Tabs row */}
                <div className="flex items-center gap-8 border-b border-slate-100 mb-6">
                    {([
                        { key: 'content', label: 'Visual Editor', icon: <Layout size={16} /> },
                        { key: 'seo', label: 'SEO', icon: <Globe size={16} /> },
                        { key: 'json', label: 'JSON Syntax', icon: <FileCode size={16} /> },
                        { key: 'preview', label: 'Preview', icon: <Eye size={16} /> },
                    ] as const).map(({ key, label, icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveView(key)}
                            className={`flex items-center gap-2 py-4 text-sm font-medium transition-all relative ${activeView === key ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {icon}
                            {label}
                            {key === 'seo' && selectedPage?.meta_title && (
                                <span className="w-2 h-2 rounded-full bg-green-500 ml-0.5" title="SEO configured" />
                            )}
                            {activeView === key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />}
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

                                {isServicesPage && (
                                    <button
                                        onClick={() => {
                                            const newSections = { ...parsedData, [`section_${Date.now()}`]: { title: 'New Section', content: '' } };
                                            handleDynamicChange(newSections);
                                            toast.success('Section Added', { description: 'A new section has been added to the editor.' });
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
                        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                            {activeView === 'content' && (
                                <div className="flex-1 overflow-auto">
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
                                </div>
                            )}
                            {activeView === 'seo' && (
                                <PageSEOPanel
                                    page={selectedPage}
                                    onSave={handleSaveSEO}
                                />
                            )}
                            {activeView === 'json' && (
                                <div className="flex-1 bg-[#1e1e1e] overflow-auto">
                                    <textarea
                                        title="JSON content"
                                        value={jsonInput}
                                        onChange={handleJsonChange}
                                        className="w-full h-full min-h-[400px] p-8 font-mono text-sm leading-relaxed resize-none bg-transparent text-slate-300 focus:outline-none"
                                        spellCheck={false}
                                    />
                                </div>
                            )}
                            {activeView === 'preview' && (
                                <div className="flex-1">
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

        </div>
    );
};

export default PagesTab;

export const PageSEOPanel = ({ page, onSave }: {
    page: CMSPageItem;
    onSave: (payload: Partial<CMSPageItem>) => Promise<void>;
}) => {
    const [title, setTitle] = useState(page.meta_title || '');
    const [description, setDescription] = useState(page.meta_description || '');
    const [keywords, setKeywords] = useState<string>(page.meta_keywords || '');
    const [author, setAuthor] = useState<string>(page.meta_author || 'Eleastar Technologies Ltd.');
    const [ogTitle, setOgTitle] = useState<string>(page.og_title || '');
    const [ogDescription, setOgDescription] = useState<string>(page.og_description || '');
    const [ogImageUrl, setOgImageUrl] = useState<string>(page.og_image_url || '');
    const [noIndex, setNoIndex] = useState<boolean>(page.no_index || false);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    // Re-sync when the selected page changes
    useEffect(() => {
        setTitle(page.meta_title || '');
        setDescription(page.meta_description || '');
        setKeywords(page.meta_keywords || '');
        setAuthor(page.meta_author || 'Eleastar Technologies Ltd.');
        setOgTitle(page.og_title || '');
        setOgDescription(page.og_description || '');
        setOgImageUrl(page.og_image_url || '');
        setNoIndex(page.no_index || false);
        setDirty(false);
    }, [page]);

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
                og_image_url: ogImageUrl,
                no_index: noIndex,
            });
            setDirty(false);
        } catch { /* handled by parent */ } finally { setSaving(false); }
    };

    const mark = () => setDirty(true);

    return (
        <div className="flex-1 overflow-auto bg-slate-50/20">
            <div className="max-w-4xl mx-auto p-8 space-y-6">

                {/* SERP Preview */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <Globe size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Google Search Preview</span>
                    </div>
                    <div className="px-6 py-5 space-y-1">
                        <div className="text-[#1a0dab] text-xl hover:underline cursor-pointer truncate">
                            {title || page.title || 'Page Title — Eleastar'}
                        </div>
                        <div className="text-[#006621] text-sm">eleastar.com › {page.slug}</div>
                        <div className="text-[#545454] text-sm line-clamp-2 leading-relaxed">
                            {description || 'No meta description set. Add one below to control how this page appears in search results.'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic SEO */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Globe size={14} /> Basic SEO
                        </h4>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-tight">Meta Title</label>
                            <input value={title} onChange={e => { setTitle(e.target.value); mark(); }}
                                placeholder={page.title}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all" />
                            <p className="text-[10px] text-slate-400 mt-1">{title.length}/60 chars recommended</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-tight">Meta Description</label>
                            <textarea value={description} onChange={e => { setDescription(e.target.value); mark(); }}
                                rows={3} placeholder="Brief summary of this page..."
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none" />
                            <p className="text-[10px] text-slate-400 mt-1">{description.length}/160 chars recommended</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-tight">Focus Keywords</label>
                            <input value={keywords} onChange={e => { setKeywords(e.target.value); mark(); }}
                                placeholder="e.g. ERP, workforce, Nigeria"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-tight">Author / Publisher</label>
                            <input value={author} onChange={e => { setAuthor(e.target.value); mark(); }}
                                placeholder="Eleastar Technologies Ltd."
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all" />
                        </div>
                        <div className="flex items-center justify-between pt-1">
                            <div>
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">No-Index</span>
                                <p className="text-[10px] text-slate-400">Prevent search engines from indexing this page</p>
                            </div>
                            <button
                                onClick={() => { setNoIndex(!noIndex); mark(); }}
                                className={`relative w-11 h-6 rounded-full transition-colors ${noIndex ? 'bg-red-500' : 'bg-slate-200'}`}
                                title={noIndex ? 'Click to allow indexing' : 'Click to block indexing'}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${noIndex ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Social Share (OG) */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Eye size={14} /> Social Share (OG)
                        </h4>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-tight">OG Image URL</label>
                            <div className="flex gap-2">
                                <input value={ogImageUrl} onChange={e => { setOgImageUrl(e.target.value); mark(); }}
                                    placeholder="https://eleastar.com/og.jpg"
                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all" />
                                {ogImageUrl && <img src={ogImageUrl} alt="OG" className="w-10 h-10 rounded-lg border border-slate-200 object-cover shrink-0" />}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-tight">OG Title</label>
                            <input value={ogTitle} onChange={e => { setOgTitle(e.target.value); mark(); }}
                                placeholder={title || page.title}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-tight">OG Description</label>
                            <textarea value={ogDescription} onChange={e => { setOgDescription(e.target.value); mark(); }}
                                rows={3} placeholder={description || 'Social share description...'}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none" />
                        </div>

                        {/* OG Preview Card */}
                        {(ogImageUrl || ogTitle || ogDescription) && (
                            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                                {ogImageUrl && <img src={ogImageUrl} alt="OG preview" className="w-full h-24 object-cover" />}
                                <div className="p-3">
                                    <div className="text-[10px] uppercase text-slate-400 mb-0.5">eleastar.com</div>
                                    <div className="font-bold text-slate-800 truncate">{ogTitle || title || page.title}</div>
                                    <div className="text-slate-500 line-clamp-2 mt-0.5">{ogDescription || description}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Save */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving || !dirty}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm ${saving || !dirty ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' : 'bg-brand-600 text-white hover:bg-brand-700'
                            }`}
                    >
                        {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                        {saving ? 'Saving...' : 'Save SEO'}
                    </button>
                </div>
            </div>
        </div>
    );
};

