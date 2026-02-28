import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useFeedback } from '../../context/FeedbackContext';
import { Save, AlertCircle, FileJson, CheckCircle } from 'lucide-react';

export const CMSPage: React.FC = () => {
    const { cmsContent, updatePMSContent } = useAdmin();
    const { showSuccess, showError } = useFeedback();

    const [activeTab, setActiveTab] = useState<'metaData' | 'navData' | 'footerNavData' | 'contactUsCardData' | 'pages'>('pages');
    const [jsonInput, setJsonInput] = useState<string>('');
    const [isDirty, setIsDirty] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();

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
    }, [location.search]);

    useEffect(() => {
        if (cmsContent && cmsContent[activeTab]) {
            setJsonInput(JSON.stringify(cmsContent[activeTab], null, 4));
            setIsDirty(false);
            setError(null);
        } else {
            setJsonInput('{}');
        }
    }, [activeTab, cmsContent]);

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setJsonInput(e.target.value);
        setIsDirty(true);
        setError(null);
        try {
            JSON.parse(e.target.value);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleSave = async () => {
        try {
            const parsed = JSON.parse(jsonInput);
            await updatePMSContent(activeTab, parsed);
            showSuccess({ title: 'Success', message: `${activeTab} updated successfully!` });
            setIsDirty(false);
        } catch (err: any) {
            showError({ title: 'Error', message: `Invalid JSON: ${err.message}` });
        }
    };

    const tabs = [
        { id: 'pages', label: 'Pages (Content)' },
        { id: 'contactUsCardData', label: 'Global Contact Card' },
        { id: 'navData', label: 'Main Navigation' },
        { id: 'footerNavData', label: 'Footer Layout' },
        { id: 'metaData', label: 'SEO & Metadata' }
    ] as const;

    if (!cmsContent) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="text-slate-500 animate-pulse">Loading CMS Structure...</div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-80px)]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Advanced CMS Object Editor</h1>
                    <p className="text-slate-500 mt-1">Directly manage the strict nested JSON topology powering the website.</p>
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
                    Save Configuration
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6 flex-grow overflow-hidden">
                {/* Sidebar */}
                <div className="w-full md:w-64 flex flex-col gap-2 overflow-y-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                if (isDirty && !window.confirm('You have unsaved changes. Discard?')) return;
                                setActiveTab(tab.id);
                            }}
                            className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all border ${activeTab === tab.id
                                ? 'bg-brand-50 border-brand-200 text-brand-700 shadow-sm'
                                : 'bg-white border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                                }`}
                        >
                            <FileJson size={18} className={activeTab === tab.id ? 'text-brand-500' : 'text-slate-400'} />
                            <span className="font-semibold text-sm">{tab.label}</span>
                        </button>
                    ))}
                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <h4 className="flex items-center gap-2 font-bold text-yellow-800 text-sm mb-2">
                            <AlertCircle size={16} /> Data Warning
                        </h4>
                        <p className="text-xs text-yellow-700 leading-relaxed">
                            This is an advanced editor reflecting the live JSON topology. Invalid formatting will crash the public frontend. Only edit specific text or URLs.
                        </p>
                    </div>
                </div>

                {/* Main Editor Area */}
                <div className="flex-grow flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                        <div className="font-mono text-xs text-slate-500 font-bold bg-slate-200 px-2 py-1 rounded">
                            cmsContent.{activeTab}
                        </div>
                        {error ? (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                                <AlertCircle size={14} /> Syntax Error
                            </div>
                        ) : isDirty ? (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded">
                                <FileJson size={14} /> Unsaved Changes
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded">
                                <CheckCircle size={14} /> Valid JSON
                            </div>
                        )}
                    </div>
                    <textarea
                        value={jsonInput}
                        onChange={handleJsonChange}
                        className={`flex-grow p-6 font-mono text-sm leading-relaxed resize-none focus:outline-none transition-colors ${error ? 'bg-red-50/30' : 'bg-transparent'
                            }`}
                        spellCheck={false}
                    />
                </div>
            </div>
        </div>
    );
};
