import React, { useEffect, useRef, useState } from 'react';
import { Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import type { CMSSection, GlobalContent, FooterContent, ServiceCollection } from '@/types';

interface CMSPreviewPaneProps {
    url: string;
    cmsContent: CMSSection[];
    globalContent: GlobalContent;
    footerContent: FooterContent;
    servicesCollection: ServiceCollection;
    pageName: string;
}

export const CMSPreviewPane: React.FC<CMSPreviewPaneProps> = ({ url, cmsContent, globalContent, footerContent, servicesCollection, pageName }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastSync, setLastSync] = useState<Date | null>(null);

    // Sync content to iframe whenever content changes
    useEffect(() => {
        const syncContent = () => {
            if (iframeRef.current && iframeRef.current.contentWindow) {
                // Post the entire CMS content state to the iframe
                // The iframe (Active App) must listen for 'CMS_PREVIEW_DATA'
                iframeRef.current.contentWindow.postMessage({
                    type: 'CMS_PREVIEW_DATA',
                    payload: { cmsContent, globalContent, footerContent, servicesCollection }
                }, '*');
                setLastSync(new Date());
            }
        };

        // Sync initially after a short delay to allow iframe to be ready
        // And then sync on every update
        const timer = setTimeout(syncContent, 1000);

        // Also try to sync immediately if it's already loaded
        if (!isLoading) {
            syncContent();
        }

        return () => clearTimeout(timer);
    }, [cmsContent, globalContent, footerContent, servicesCollection, isLoading, url]);

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleRefresh = () => {
        if (iframeRef.current) {
            setIsLoading(true);
            iframeRef.current.src = url;
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-100 rounded-xl overflow-hidden border border-slate-300 shadow-inner">
            {/* Preview Toolbar */}
            <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="px-2 py-1 bg-brand-100 text-brand-700 text-xs font-bold uppercase rounded border border-brand-200">
                        Visual Preview
                    </div>
                    <span className="text-xs text-slate-500 font-mono hidden md:inline-block">
                        {url}
                    </span>
                    {isLoading && <span className="text-xs text-slate-400 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Loading...</span>}
                    {!isLoading && lastSync && <span className="text-xs text-green-600 flex items-center gap-1"> Synced {lastSync.toLocaleTimeString()}</span>}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        title="Reload Frame"
                    >
                        <RefreshCw size={14} />
                    </button>
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        title="Open in New Tab"
                    >
                        <ExternalLink size={14} />
                    </a>
                </div>
            </div>

            {/* Iframe Container */}
            <div className="grow relative bg-white">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 size={32} className="animate-spin text-brand-500" />
                            <p className="text-sm text-slate-500 font-medium">Loading Preview...</p>
                        </div>
                    </div>
                )}

                <iframe
                    ref={iframeRef}
                    src={url}
                    className="w-full h-full border-0"
                    title={`Preview of ${pageName}`}
                    onLoad={handleLoad}
                    sandbox="allow-scripts allow-same-origin allow-forms" // Relaxed sandbox for React app functioning
                />
            </div>

            <div className="bg-yellow-50 px-4 py-2 text-[10px] text-yellow-700 border-t border-yellow-100 text-center">
                Preview Mode: Internal links may navigate within the frame. External links may be blocked.
            </div>
        </div>
    );
};
