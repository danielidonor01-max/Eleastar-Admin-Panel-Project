import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { StickyHeader } from '../components/StickyHeader';
import type {
    ServiceDetailHeroSection,
    ServiceDetailOverviewSection,
    ServiceDetailOfferingSection,
    ServiceDetailContactSection
} from '../data/mockData';

interface ServiceDetailProps {
    pageName: 'IndustrialSolutions' | 'InformationTechnology' | 'ResearchAndDevelopment' | 'ElectronicsManufacturing' | 'SpecificITServices' | 'Services'; // Extensible for future pages
}

export const ServiceDetail: React.FC<ServiceDetailProps> = ({ pageName }) => {
    const { cmsContent } = useAdmin();

    // Filter and Sort Content for this specific page
    const sections = cmsContent
        .filter(s => s.page === pageName && s.isVisible)
        .sort((a, b) => a.order - b.order);

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <StickyHeader />
            <main className="flex-grow w-full">
                {sections.map((section) => {
                    switch (section.type) {
                        case 'ServiceDetailHero':
                            return <DetailHeroRenderer key={section.id} data={section as ServiceDetailHeroSection} />;
                        case 'ServiceDetailOverview':
                            return <OverviewRenderer key={section.id} data={section as ServiceDetailOverviewSection} />;
                        case 'ServiceDetailOffering':
                            // Determine layout direction 
                            const offeringIndex = sections
                                .filter(s => s.type === 'ServiceDetailOffering')
                                .findIndex(s => s.id === section.id);

                            const isTextLeft = offeringIndex % 2 === 0;
                            return <OfferingRenderer key={section.id} data={section as ServiceDetailOfferingSection} isTextLeft={isTextLeft} />;
                        case 'ServiceDetailContact':
                            return <DetailContactRenderer key={section.id} data={section as ServiceDetailContactSection} />;
                        default:
                            return null;
                    }
                })}
            </main>
            <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Eleastar</h2>
                    <p className="mb-8 max-w-lg mx-auto">Innovating for a better tomorrow. Connect with us to transform your business infrastructure.</p>
                    <div className="text-sm">
                        &copy; {new Date().getFullYear()} Eleastar Technologies Limited. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

// --- Renderers ---

const DetailHeroRenderer: React.FC<{ data: ServiceDetailHeroSection }> = ({ data }) => {
    return (
        <section className="bg-white pt-32 pb-16 px-6 md:px-12 lg:px-24">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-extrabold text-[#0B1C3E] mb-6">
                    {data.title.split(' ').map((word, i) => (
                        <span key={i} className="block">{word}</span>
                    ))}
                </h1>
                <div className="w-12 h-1 bg-[#0B1C3E] mb-8 rounded-full" />
                <p className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
                    {data.intro}
                </p>
            </div>
            {/* Decorative Icon */}
            <div className="max-w-7xl mx-auto mt-8">
                <div className="w-8 h-8 rounded-full border-2 border-[#0B1C3E] flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#0B1C3E] rounded-full" />
                </div>
            </div>
        </section>
    );
};

const OverviewRenderer: React.FC<{ data: ServiceDetailOverviewSection }> = ({ data }) => {
    return (
        <section className="w-full px-6 md:px-12 lg:px-24 pb-20 bg-white">
            <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden shadow-sm h-[400px] md:h-[600px]">
                <img src={data.imageUrl} alt={data.altText} className="w-full h-full object-cover" />
            </div>
        </section>
    );
};

// Dark Section Wrapper for Offerings
const OfferingRenderer: React.FC<{ data: ServiceDetailOfferingSection; isTextLeft: boolean }> = ({ data, isTextLeft }) => {
    return (
        <section className="bg-[#0B0F19] text-white py-24 px-6 md:px-12 lg:px-24 overflow-hidden relative">
            <div className={`max-w-7xl mx-auto flex flex-col items-center gap-16 lg:gap-24 ${isTextLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>

                {/* Text Content */}
                <div className="w-full lg:w-1/2 relative z-10">
                    <div className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 font-bold rounded-full mb-6">
                        {data.number}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                        {data.title}
                    </h2>
                    <p className="text-gray-400 text-lg leading-relaxed mb-8">
                        {data.description}
                    </p>

                    {/* Decorative Line connection (visual only) */}
                    <div className={`hidden lg:block absolute top-[120%] ${isTextLeft ? 'left-10 h-32 border-l border-dashed border-gray-700' : 'right-10 h-32 border-r border-dashed border-gray-700'}`}></div>
                </div>

                {/* Image Content */}
                <div className="w-full lg:w-1/2">
                    <div className="relative rounded-3xl overflow-hidden h-[400px] md:h-[500px]">
                        <img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover" />
                        {/* Optional overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent opacity-40"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const DetailContactRenderer: React.FC<{ data: ServiceDetailContactSection }> = ({ data }) => {
    return (
        <section className="relative w-full h-[600px] overflow-hidden">
            {/* Background - using a placeholder office image for context, typically static or from data if needed. 
                 Since data only has text, we'll hardcode a nice office bg or use the previous section's style.
                 The design shows an image with an overlay card. Let's use a standard bg for now or ask to add bg to data?
                 Plan didn't add bg to Contact Data. I'll use a generic one.
             */}
            <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80" alt="Office" className="absolute inset-0 w-full h-full object-cover" />

            <div className="absolute inset-0 bg-black/40"></div>

            <div className="relative z-10 h-full flex items-center justify-end max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
                <div className="bg-[#6DC5E8] p-10 md:p-14 rounded-3xl max-w-lg text-[#0B1C3E] shadow-2xl">
                    <h2 className="text-4xl font-bold mb-6">{data.title}</h2>
                    <p className="text-lg mb-8 leading-relaxed font-medium opacity-90">
                        {data.description}
                    </p>
                    <a href={data.ctaLink} className="inline-block w-full py-4 bg-[#0B1C3E] text-white text-center font-bold rounded-full hover:bg-opacity-90 transition-all shadow-lg">
                        {data.ctaLabel}
                    </a>
                </div>
            </div>
        </section>
    );
};
