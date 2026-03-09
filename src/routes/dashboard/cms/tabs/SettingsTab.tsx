import { useCMSStore } from "@/stores/useCMSStore";
import { toast } from "sonner";
import { cmsService } from "@/services/cmsService";
import { useState, useEffect } from "react";
import { DynamicJsonEditor } from "@/components/DynamicJsonEditor";
import { AlertCircle, Globe, Layout, RefreshCw, Save, Edit2 } from "lucide-react";

const SettingsTab = ({ section = 'GlobalSEO' }: { section?: string }) => {
    const globalContent = useCMSStore((s) => s.globalContent);
    const updateGlobal = useCMSStore((s) => s.updateGlobal);
    const updatePMSContent = useCMSStore((s) => s.updatePMSContent);
    

    // ── Global SEO sub-section state ──
    const [siteName, setSiteName] = useState(globalContent.siteName || '');
    const [metaDesc, setMetaDesc] = useState(globalContent.metaDescription || '');
    const [metaKeys, setMetaKeys] = useState(globalContent.metaKeywords || '');
    const [seoTitle, setSeoTitle] = useState(globalContent.seoDefaults?.siteTitle || '');
    const [ogImage, setOgImage] = useState(globalContent.seoDefaults?.ogImage || '');
    const [saving, setSaving] = useState(false);

    // ── Footer / content sub-section state ──
    const [footerParsed, setFooterParsed] = useState<Record<string, unknown>>({});
    const [footerDirty, setFooterDirty] = useState(false);
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
            .catch(() => { 
                toast.error('Error', { description: 'Failed to load footer content.' });
            })
            .finally(() => setLoadingFooter(false));
    }, [section]);

    const handleSaveSEO = async () => {
        setSaving(true);
        try {
            await updateGlobal('siteName', siteName);
            await updateGlobal('metaDescription', metaDesc);
            await updateGlobal('metaKeywords', metaKeys);
            await updateGlobal('seoDefaults', { ...globalContent.seoDefaults, siteTitle: seoTitle, ogImage });
            toast.success('Settings Saved', { description: 'Global SEO defaults updated.' });
        } catch (e: unknown) {
            toast.error('Save Failed', { description: e instanceof Error ? e.message : 'Unknown error' });
        } finally { setSaving(false); }
    };

    const handleSaveFooterContent = async () => {
        const slug = sectionSlugMap[section];
        if (!slug) return;
        setSaving(true);
        try {
            await updatePMSContent(slug, footerParsed);
            toast.success('Saved', { description: 'Content updated successfully.' });
            setFooterDirty(false);
        } catch (e: unknown) {
            toast.error('Save Failed', { description: e instanceof Error ? e.message : 'Unknown error' });
        } finally { setSaving(false); }
    };

    // ── Footer/Legal sub-section view ──
    if (section !== 'GlobalSEO') {
        const pageLabel = section === 'FooterLayout' ? 'Footer Layout' : section === 'PrivacyPolicy' ? 'Privacy Policy' : 'Terms of Service';
        return (
            <div className="h-full flex flex-col bg-white">
                <div className="px-8 py-6 shrink-0 border-b border-slate-100">
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
                                    {footerDirty && (
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100 animate-pulse">
                                            <AlertCircle size={12} /> Unsaved Changes
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={handleSaveFooterContent}
                                    disabled={!footerDirty || saving}
                                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${!footerDirty ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm'}`}
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
                                        {ogImage && <img src={ogImage} alt="OG Preview" className="w-10 h-10 rounded-lg border border-slate-200 object-cover shrink-0" />}
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

export default SettingsTab;

