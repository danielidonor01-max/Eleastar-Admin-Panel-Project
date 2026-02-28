import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useFeedback } from '../../context/FeedbackContext';
import { Save, AlertCircle, CheckCircle, Eye, Layout, FileCode } from 'lucide-react';
import { DynamicJsonEditor } from '../../components/DynamicJsonEditor';
import { CMSPreviewPane } from '../../components/CMSPreviewPane';
import { PUBLIC_LINK } from '../../config';

export const CMSPage: React.FC = () => {
    const { cmsContent, globalContent, updatePMSContent } = useAdmin();
    const { showSuccess, showError } = useFeedback();

    const [activeTab, setActiveTab] = useState<'metaData' | 'navData' | 'footerNavData' | 'contactUsCardData' | 'pages'>('pages');
    const [activeView, setActiveView] = useState<'editor' | 'preview' | 'json'>('editor');
    const [activePageObjectRoute, setActivePageObjectRoute] = useState<string>('Home');
    const [jsonInput, setJsonInput] = useState<string>('');
    const [parsedData, setParsedData] = useState<any>(null); // For Dynamic Form Edit state
    const [isDirty, setIsDirty] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();

    const PREVIEW_URL = PUBLIC_LINK || window.location.origin;

    // Map Sidebar URL Params to the correct JSON Topology Tab
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const page = params.get('page');
        let targetTab: typeof activeTab = 'pages';

        if (page === 'GlobalSEO' || page === 'PrivacyPolicy' || page === 'TermsOfService') targetTab = 'metaData';
        else if (page === 'GlobalNav') targetTab = 'navData';
        else if (page === 'FooterLayout') targetTab = 'footerNavData';
        else if (page === 'Contact') targetTab = 'contactUsCardData';

        setActiveTab(targetTab);
        setActivePageObjectRoute(page || 'Home');
    }, [location.search]);

    // Load CMS Content from State -> JSON Text + Parsed Data for Visual Editor
    useEffect(() => {
        if (cmsContent && cmsContent[activeTab]) {
            let rawData = cmsContent[activeTab];

            // Isolate further if it's a specific page in the 'pages' tab
            if (activeTab === 'pages' && activePageObjectRoute) {
                const pageKey = activePageObjectRoute.toLowerCase();
                // Check if the page exists in the pages object
                if ((rawData as any)[pageKey]) {
                    rawData = (rawData as any)[pageKey];
                }
            }

            setJsonInput(JSON.stringify(rawData, null, 4));
            setParsedData(JSON.parse(JSON.stringify(rawData))); // deep copy isolate
            setIsDirty(false);
            setError(null);
        } else {
            setJsonInput('{}');
            setParsedData({});
        }
    }, [activeTab, activePageObjectRoute, cmsContent]);

    // Handle RAW JSON Text Change
    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setJsonInput(e.target.value);
        setIsDirty(true);
        setError(null);
        try {
            const parsed = JSON.parse(e.target.value);
            setParsedData(parsed); // Sync the visual editor tree under the hood
        } catch (err: any) {
            setError(err.message);
        }
    };

    // Handle VISUAL Form Change
    const handleDynamicDataChange = (newData: any) => {
        setParsedData(newData);
        setJsonInput(JSON.stringify(newData, null, 4));
        setIsDirty(true);
        setError(null);
    };

    const handleSave = async () => {
        try {
            let payloadToSave = parsedData;

            // If we are editing a specific page, merge it back into the full 'pages' object
            if (activeTab === 'pages' && activePageObjectRoute) {
                const pageKey = activePageObjectRoute.toLowerCase();
                payloadToSave = {
                    ...(cmsContent?.pages || {}),
                    [pageKey]: parsedData
                };
            }

            await updatePMSContent(activeTab, payloadToSave);
            showSuccess({ title: 'Success', message: `${activePageObjectRoute || activeTab} updated successfully!` });
            setIsDirty(false);
        } catch (err: any) {
            showError({ title: 'Error', message: `Save failed: ${err.message}` });
        }
    };

    if (!cmsContent) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="text-slate-500 animate-pulse">Loading CMS Structure...</div>
            </div>
        );
    }

    // Determine the exact URL to preview
    const extractClientRoute = () => {
        if (activePageObjectRoute === 'About') return `${PREVIEW_URL}/about`;
        if (activePageObjectRoute === 'Services') return `${PREVIEW_URL}/services`;
        if (activePageObjectRoute === 'Contact') return `${PREVIEW_URL}/contact`;
        if (activePageObjectRoute === 'Careers') return `${PREVIEW_URL}/careers`;
        if (activePageObjectRoute.includes('ServiceDetail')) return `${PREVIEW_URL}/services/industrial-solutions`; // fallback child
        return PREVIEW_URL; // Home or Global components fallback to Index
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto flex flex-col h-[calc(100vh-80px)]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                        CMS Editor
                        <span className="px-2 py-0.5 rounded bg-brand-100 text-brand-700 text-xs font-bold font-mono border border-brand-200 uppercase tracking-widest">
                            {activeTab} • {activePageObjectRoute}
                        </span>
                    </h1>
                    <p className="text-slate-500 mt-1">Manage the core JSON data powering the Eleastar website application.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!isDirty || !!error}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all shadow-sm
                        ${!isDirty || !!error
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-md'}`}
                >
                    <Save size={18} />
                    {isDirty ? 'Save Unsaved Changes' : 'Saved'}
                </button>
            </div>

            <div className="flex flex-col xl:flex-row gap-6 flex-grow overflow-hidden">
                {/* Main Hybrid Editor Workspace */}
                <div className="flex-grow flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative min-w-0">

                    {/* View Switcher Tabs */}
                    <div className="flex border-b border-slate-200 bg-slate-50 flex-shrink-0">
                        <button
                            onClick={() => setActiveView('preview')}
                            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeView === 'preview' ? 'bg-white text-brand-600 border-t-2 border-t-brand-600 shadow-sm z-10' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                        >
                            <Eye size={16} /> Live Iframe Preview
                        </button>
                        <button
                            onClick={() => setActiveView('editor')}
                            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeView === 'editor' ? 'bg-white text-brand-600 border-t-2 border-t-brand-600 shadow-sm z-10' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                        >
                            <Layout size={16} /> Visual Form Builder
                        </button>
                        <button
                            onClick={() => setActiveView('json')}
                            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeView === 'json' ? 'bg-white text-brand-600 border-t-2 border-t-brand-600 shadow-sm z-10' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                        >
                            <FileCode size={16} /> Raw JSON Syntax
                        </button>
                    </div>

                    {/* Status Bar */}
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 flex-shrink-0 text-xs">
                        {error ? (
                            <div className="flex items-center gap-1.5 font-bold text-red-500 px-2 py-0.5 rounded">
                                <AlertCircle size={14} /> Syntax Error (Cannot Save)
                            </div>
                        ) : isDirty ? (
                            <div className="flex items-center gap-1.5 font-bold text-amber-500 animate-pulse px-2 py-0.5 rounded">
                                <AlertCircle size={14} /> Unsaved Database Changes
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 font-bold text-green-500 px-2 py-0.5 rounded">
                                <CheckCircle size={14} /> Database Synchronized
                            </div>
                        )}
                    </div>

                    {/* Editor Content Box */}
                    <div className="flex-grow overflow-auto bg-slate-50/30">
                        {activeView === 'editor' && (
                            <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-300">
                                <div className="bg-white border text-left border-slate-200 rounded-xl p-6 shadow-sm">
                                    <DynamicJsonEditor
                                        data={parsedData}
                                        onChange={handleDynamicDataChange}
                                        label={activeTab} // Root label
                                        level={0}
                                    />
                                </div>
                            </div>
                        )}

                        {activeView === 'json' && (
                            <textarea
                                value={jsonInput}
                                onChange={handleJsonChange}
                                className={`w-full h-full p-6 font-mono text-sm leading-relaxed resize-none focus:outline-none transition-colors ${error ? 'bg-red-50/30 text-red-900' : 'bg-transparent text-slate-800'
                                    }`}
                                spellCheck={false}
                                placeholder="Paste or edit strict JSON configuration here..."
                            />
                        )}

                        {activeView === 'preview' && (
                            <div className="h-[95vh] animate-in fade-in duration-300 -mt-10 overflow-hidden relative">
                                {/* -mt-10 trick to force full height iframe feeling inside flex */}
                                <CMSPreviewPane
                                    url={extractClientRoute()}
                                    cmsContent={{
                                        ...(cmsContent || {}),
                                        [activeTab]: activeTab === 'pages' && activePageObjectRoute
                                            ? { ...(cmsContent?.pages || {}), [activePageObjectRoute.toLowerCase()]: parsedData }
                                            : parsedData
                                    } as any}
                                    globalContent={globalContent}
                                    pageName={activePageObjectRoute}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
