import React from 'react';
import { useCMS } from '../context/CMSContext';
import { StickyHeader } from '../components/StickyHeader';
import { BrandFooter } from '../components/BrandFooter';
import type { CMSServiceItemData } from '../types/cms';

interface ServiceDetailProps {
    pageName: 'IndustrialSolutions' | 'InformationTechnology' | 'ResearchAndDevelopment' | 'ElectronicsManufacturing' | 'SpecificITServices' | 'Services';
}

// Map the old pageName to the new backend schema slug
const slugMap: Record<string, string> = {
    'InformationTechnology': 'information-technology-services',
    'ResearchAndDevelopment': 'research-and-development',
    // Mock the remaining since the backend JSON schema only lists one right now, but it's extensible
    'IndustrialSolutions': 'industrial-solutions',
    'ElectronicsManufacturing': 'electronics-manufacturing',
    'SpecificITServices': 'specific-it-services',
    'Services': 'services'
};

export const ServiceDetail: React.FC<ServiceDetailProps> = ({ pageName }) => {
    const { cmsContent } = useCMS();

    const targetSlug = slugMap[pageName] || pageName;
    const servicesListData = cmsContent?.pages?.services?.servicesListData || [];
    const serviceData = servicesListData.find(s => s.slug === targetSlug);

    if (!serviceData) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans flex flex-col pt-32 pb-16 px-6 text-center">
                <StickyHeader />
                <h1 className="text-4xl font-bold bg-white p-12 rounded-xl shadow-sm text-slate-800">
                    Service details currently being updated.
                </h1>
                <BrandFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <StickyHeader />
            <main className="flex-grow w-full">
                {/* Hero Section */}
                <section className="bg-white pt-32 pb-16 px-6 md:px-12 lg:px-24">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-[#0B1C3E] mb-6">
                            {serviceData.title}
                        </h1>
                        <div className="w-12 h-1 bg-[#0B1C3E] mb-8 rounded-full" />
                        <p className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
                            {serviceData.description}
                        </p>
                    </div>
                </section>

                {/* Banner Overview */}
                {serviceData.bannerImage && (
                    <section className="w-full px-6 md:px-12 lg:px-24 pb-20 bg-white">
                        <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden shadow-sm h-[400px] md:h-[600px]">
                            <img src={serviceData.bannerImage} alt={serviceData.bannerImageAlt || serviceData.title} className="w-full h-full object-cover" />
                        </div>
                    </section>
                )}

                {/* Content Blocks */}
                {serviceData.servicesContent && serviceData.servicesContent.map((block: CMSServiceItemData, idx: number) => {
                    const isTextLeft = idx % 2 === 0;
                    return (
                        <section key={idx} className="bg-[#0B0F19] text-white py-24 px-6 md:px-12 lg:px-24 overflow-hidden relative">
                            <div className={`max-w-7xl mx-auto flex flex-col items-center gap-16 lg:gap-24 ${isTextLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                                <div className="w-full lg:w-1/2 relative z-10">
                                    <div className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 font-bold rounded-full mb-6">
                                        0{idx + 1}
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                                        {block.TextTitle1} {block.TextTitle2}
                                    </h2>
                                    <p className="text-gray-400 text-lg leading-relaxed mb-8">
                                        {block.TextDescription}
                                    </p>
                                </div>

                                <div className="w-full lg:w-1/2">
                                    <div className="relative rounded-3xl overflow-hidden h-[400px] md:h-[500px]">
                                        <img src={block.image} alt={block.imageAlt || `${block.TextTitle1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent opacity-40"></div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    );
                })}
            </main>
            <BrandFooter />
        </div>
    );
};
