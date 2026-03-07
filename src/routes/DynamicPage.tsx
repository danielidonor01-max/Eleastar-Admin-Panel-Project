import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router';
import { useCMS } from '../context/CMSContext';
import { StickyHeader } from '../components/StickyHeader';
import { BrandFooter } from '../components/BrandFooter';
import { ContactUsCard } from '../components/cms/ContactUsCard';
import { PageSEO } from '../components/cms/PageSEO';

export const DynamicPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { cmsContent } = useCMS();

    // Safety checks
    if (!slug) return <Navigate to="/" replace />;
    if (!cmsContent) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-slate-500 animate-pulse font-medium">Loading Page Content...</div>
            </div>
        );
    }

    const safeSlug = slug.toLowerCase();

    // Check if the page exists in the CMS DB
    const pageData = cmsContent.pages[safeSlug];
    const seoData = cmsContent.metaData.find(m => m.slug === safeSlug);

    // If no page blueprint exists for the slug, 404
    if (!pageData) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans p-8">
                <h1 className="text-6xl font-extrabold text-slate-800 mb-4 tracking-tight">404</h1>
                <p className="text-xl text-slate-500 max-w-md text-center">
                    The page you are looking for at <code className="bg-slate-200 px-2 py-1 rounded text-slate-700">/{slug}</code> does not exist or has been removed.
                </p>
                <a href="/" className="mt-8 px-6 py-3 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors shadow-sm">
                    Return to Homepage
                </a>
            </div>
        );
    }

    const { contactUsCardData } = cmsContent;

    useEffect(() => {
        if (seoData) {
            document.title = seoData.title;
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute('content', seoData.description);
            } else {
                const meta = document.createElement('meta');
                meta.name = 'description';
                meta.content = seoData.description;
                document.head.appendChild(meta);
            }
        }
    }, [seoData]);

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <PageSEO slug={safeSlug} fallbackDescription={seoData?.description} />
            <StickyHeader />

            <main className="grow w-full flex flex-col">
                {/* 
                  Since Eleastar uses heavily customized React Component blocks connected to specific JSON schema paths 
                  (like AboutEleastarHeroData, etc), generic dynamic pages that don't match standard routing will render 
                  a unified "Under Construction / Blank Canvas" block. The Admin can start building the generic layout from here 
                */}

                {/* Hero Fallback / Universal Banner */}
                <section className="bg-slate-900 py-32 px-6 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-brand-900/40 mix-blend-multiply" />
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[size:24px_24px]" />
                    <div className="relative text-center max-w-3xl animate-in slide-in-from-bottom duration-700">
                        <span className="text-brand-400 font-bold tracking-widest uppercase mb-4 block">Eleastar Dynamic Page</span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 capitalize leading-tight">
                            {slug.replace(/-/g, ' ')}
                        </h1>
                        <p className="text-xl text-slate-300">
                            {seoData?.description || 'Content structure for this dynamic page is currently being generated.'}
                        </p>
                    </div>
                </section>

                {/* Content Area */}
                <section className="py-24 px-6 grow flex items-center justify-center bg-slate-50">
                    {(!pageData || Object.keys(pageData as object).length === 0 || (Object.keys(pageData as object).length === 1 && ((pageData as Record<string, unknown>).heroCardData as unknown[] | undefined)?.length === 0)) ? (
                        <div className="max-w-2xl text-center">
                            <h2 className="text-2xl font-bold text-slate-700 mb-4">Blank Canvas</h2>
                            <p className="text-slate-500 leading-relaxed">
                                This page is currently empty. As an Administrator, you can open the CMS Editor in the Admin Dashboard, navigate to <strong className="text-slate-800">Pages • {slug}</strong>, and begin adding content nodes matching the Eleastar Component Library standards.
                            </p>
                        </div>
                    ) : (
                        <div className="max-w-5xl w-full mx-auto">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Raw Data Payload Preview</h3>
                                <pre className="text-sm font-mono text-slate-600 overflow-x-auto p-4 bg-slate-50 rounded-lg whitespace-pre-wrap">
                                    {JSON.stringify(pageData, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </section>

                {contactUsCardData && <ContactUsCard data={contactUsCardData} />}
            </main>

            <BrandFooter />
        </div>
    );
};
