import { useState, useEffect } from 'react';
import { Globe, Eye, RefreshCw, Save } from 'lucide-react';

interface PageSEOPanelProps {
    page: { slug: string; name: string; meta_title?: string; meta_description?: string; meta_keywords?: string; meta_author?: string; og_title?: string; og_description?: string; og_image_url?: string; meta_noindex?: boolean; no_index?: boolean };
    onSave: (payload: Record<string, unknown>) => Promise<void>;
}

export const PageSEOPanel = ({ page, onSave }: PageSEOPanelProps) => {
    const [title, setTitle] = useState(page.meta_title || '');
    const [description, setDescription] = useState(page.meta_description || '');
    const [keywords, setKeywords] = useState(page.meta_keywords || '');
    const [author, setAuthor] = useState(page.meta_author || 'Eleastar Technologies Ltd.');
    const [ogTitle, setOgTitle] = useState(page.og_title || '');
    const [ogDescription, setOgDescription] = useState(page.og_description || '');
    const [ogImageUrl, setOgImageUrl] = useState(page.og_image_url || '');
    const [noIndex, setNoIndex] = useState(Boolean(page.meta_noindex ?? page.no_index));
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        setTitle(page.meta_title || '');
        setDescription(page.meta_description || '');
        setKeywords(page.meta_keywords || '');
        setAuthor(page.meta_author || 'Eleastar Technologies Ltd.');
        setOgTitle(page.og_title || '');
        setOgDescription(page.og_description || '');
        setOgImageUrl(page.og_image_url || '');
        setNoIndex(Boolean(page.meta_noindex ?? page.no_index));
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
    const pageTitle = page.name;

    return (
        <div className="flex-1 overflow-auto bg-slate-50/20">
            <div className="max-w-4xl mx-auto p-8 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <Globe size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Google Search Preview</span>
                    </div>
                    <div className="px-6 py-5 space-y-1">
                        <div className="text-[#1a0dab] text-xl hover:underline cursor-pointer truncate">
                            {title || pageTitle || 'Page Title — Eleastar'}
                        </div>
                        <div className="text-[#006621] text-sm">eleastar.com › {page.slug}</div>
                        <div className="text-[#545454] text-sm line-clamp-2 leading-relaxed">
                            {description || 'No meta description set. Add one below to control how this page appears in search results.'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Globe size={14} /> Basic SEO
                        </h4>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-tight">Meta Title</label>
                            <input value={title} onChange={(e) => { setTitle(e.target.value); mark(); }} placeholder={pageTitle}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all" />
                            <p className="text-[10px] text-slate-400 mt-1">{title.length}/60 chars recommended</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-tight">Meta Description</label>
                            <textarea value={description} onChange={(e) => { setDescription(e.target.value); mark(); }}
                                rows={3} placeholder="Brief summary of this page..."
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none" />
                            <p className="text-[10px] text-slate-400 mt-1">{description.length}/160 chars recommended</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-tight">Focus Keywords</label>
                            <input value={keywords} onChange={(e) => { setKeywords(e.target.value); mark(); }}
                                placeholder="e.g. ERP, workforce, Nigeria"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-tight">Author / Publisher</label>
                            <input value={author} onChange={(e) => { setAuthor(e.target.value); mark(); }}
                                placeholder="Eleastar Technologies Ltd."
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all" />
                        </div>
                        <div className="flex items-center justify-between pt-1">
                            <div>
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">No-Index</span>
                                <p className="text-[10px] text-slate-400">Prevent search engines from indexing this page</p>
                            </div>
                            <button onClick={() => { setNoIndex(!noIndex); mark(); }}
                                className={`relative w-11 h-6 rounded-full transition-colors ${noIndex ? 'bg-red-500' : 'bg-slate-200'}`}
                                title={noIndex ? 'Click to allow indexing' : 'Click to block indexing'}>
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${noIndex ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Eye size={14} /> Social Share (OG)
                        </h4>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-tight">OG Image URL</label>
                            <div className="flex gap-2">
                                <input value={ogImageUrl} onChange={(e) => { setOgImageUrl(e.target.value); mark(); }}
                                    placeholder="https://eleastar.com/og.jpg"
                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all" />
                                {ogImageUrl && <img src={ogImageUrl} alt="OG" className="w-10 h-10 rounded-lg border border-slate-200 object-cover shrink-0" />}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-tight">OG Title</label>
                            <input value={ogTitle} onChange={(e) => { setOgTitle(e.target.value); mark(); }}
                                placeholder={title || pageTitle}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-tight">OG Description</label>
                            <textarea value={ogDescription} onChange={(e) => { setOgDescription(e.target.value); mark(); }}
                                rows={3} placeholder={description || 'Social share description...'}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none" />
                        </div>
                        {(ogImageUrl || ogTitle || ogDescription) && (
                            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                                {ogImageUrl && <img src={ogImageUrl} alt="OG preview" className="w-full h-24 object-cover" />}
                                <div className="p-3">
                                    <div className="text-[10px] uppercase text-slate-400 mb-0.5">eleastar.com</div>
                                    <div className="font-bold text-slate-800 truncate">{ogTitle || title || pageTitle}</div>
                                    <div className="text-slate-500 line-clamp-2 mt-0.5">{ogDescription || description}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button onClick={handleSave} disabled={saving || !dirty}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm ${saving || !dirty ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' : 'bg-brand-600 text-white hover:bg-brand-700'}`}>
                        {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                        {saving ? 'Saving...' : 'Save SEO'}
                    </button>
                </div>
            </div>
        </div>
    );
};
