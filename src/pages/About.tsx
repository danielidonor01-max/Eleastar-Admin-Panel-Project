import React from 'react';
import { useCMS } from '../context/CMSContext';
import { StickyHeader } from '../components/StickyHeader';
import { BrandFooter } from '../components/BrandFooter';
import type { CMSAboutHeroData } from '../types/cms';
import { ContactUsCard } from '../components/cms/ContactUsCard';
import { PageSEO } from '../components/cms/PageSEO';

const AboutHeroRenderer: React.FC<{ data: CMSAboutHeroData }> = ({ data }) => (
    <section className="relative h-[80vh] min-h-[600px] overflow-hidden bg-slate-900 text-white flex items-center">
        <div className="absolute inset-0">
            <img
                src={data.image.url}
                alt={data.image.alt || data.bottomTitle}
                className="w-full h-full object-cover opacity-40 animate-pulse-slow"
                style={{ animationDuration: '10s' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-3xl animate-in slide-in-from-bottom duration-700">
                <span className="text-brand-400 font-bold tracking-wider uppercase mb-4 block">
                    {data.topTitle.first} {data.topTitle.second}
                </span>
                <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight">{data.bottomTitle}</h1>
                <p className="text-xl md:text-2xl text-slate-300 leading-relaxed max-w-2xl">{data.description}</p>
            </div>
        </div>
    </section>
);

export const About: React.FC = () => {
    const { cmsContent } = useCMS();

    const aboutData = cmsContent?.pages?.about;
    const globalContactData = cmsContent?.contactUsCardData;

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <PageSEO slug="about" />
            <StickyHeader />
            <main className="flex-grow w-full">
                {aboutData?.aboutEleastarHeroData && <AboutHeroRenderer data={aboutData.aboutEleastarHeroData} />}
                {globalContactData && <ContactUsCard data={globalContactData} />}
            </main>
            <BrandFooter />
        </div>
    );
};
