import React, { useEffect, useRef } from 'react';

interface CMSPreviewPaneProps {
    url: string;
    cmsContent: any;
    globalContent?: any;
    pageName: string;
}

export const CMSPreviewPane: React.FC<CMSPreviewPaneProps> = ({ url, cmsContent, globalContent, pageName }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Sync state into iframe whenever content changes
    useEffect(() => {
        if (!iframeRef.current || !iframeRef.current.contentWindow) return;

        // Give the iframe a tiny bit of time to load initially if we just mounted
        const timer = setTimeout(() => {
            if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage(
                    {
                        type: 'live-preview-update',
                        data: {
                            cmsContent,
                            globalContent,
                            pageName
                        }
                    },
                    '*'
                );
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [cmsContent, globalContent, pageName]);

    return (
        <div className="w-full h-full flex flex-col bg-slate-100 rounded-b-xl overflow-hidden relative border-t border-slate-200">
            {/* Browser Header Mock */}
            <div className="bg-slate-200 h-10 flex items-center px-4 shrink-0 border-b border-slate-300">
                <div className="flex gap-1.5 mr-4">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="bg-white px-3 py-1 rounded text-xs text-slate-500 font-mono grow max-w-2xl shadow-inner flex items-center justify-center">
                    {url}
                </div>
            </div>

            {/* Iframe Container */}
            <div className="grow relative bg-white">
                {/* Loader overlay behind the iframe */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                </div>

                <iframe
                    ref={iframeRef}
                    src={url}
                    className="w-full h-full relative z-10 border-none bg-white"
                    title="Live Preview"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                    onLoad={() => {
                        // Resend the payload immediately upon iframe load complete to ensure sync
                        if (iframeRef.current?.contentWindow) {
                            iframeRef.current.contentWindow.postMessage(
                                {
                                    type: 'live-preview-update',
                                    data: {
                                        cmsContent,
                                        globalContent,
                                        pageName
                                    }
                                },
                                '*'
                            );
                        }
                    }}
                />
            </div>

            {/* Sync Status Banner */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold shadow-lg z-20 flex items-center gap-2 animate-bounce">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                Real-time Sync Active
            </div>
        </div>
    );
};
