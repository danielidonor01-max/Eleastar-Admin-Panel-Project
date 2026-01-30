import React from 'react';
import { useAdmin } from '../context/AdminContext';
import type {
    ServicesHeroSection,
    ServiceBlockSection,
    ContactCTASection
} from '../data/mockData';
import { StickyHeader } from '../components/StickyHeader';
import { BrandFooter } from '../components/BrandFooter';

export const Services: React.FC = () => {
    const { cmsContent } = useAdmin();

    // Filter and Sort Services Page Content
    const sections = cmsContent
        .filter(s => s.page === 'Services' && s.isVisible)
        .sort((a, b) => a.order - b.order);

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col">
            <StickyHeader />
            <main className="flex-grow pt-16 w-full">
                {sections.map((section) => {
                    switch (section.type) {
                        case 'ServicesHero':
                            return <HeroRenderer key={section.id} data={section as ServicesHeroSection} />;
                        case 'ServiceBlock':
                            // Determine layout direction based on order or index among service blocks
                            // Assuming sections are strictly ordered: Hero is 1. Blocks are 2,3,4,5,6.
                            // Even order (2, 4, 6) -> Image Left? Or Right? 
                            // Common pattern: First block (Order 2) usually Image Left.
                            // Let's alternate: Order 2 (Even) -> Left, Order 3 (Odd) -> Right.
                            const isImageLeft = section.order % 2 === 0;
                            return <ServiceBlockRenderer key={section.id} data={section as ServiceBlockSection} isImageLeft={isImageLeft} />;
                        case 'ContactCTA':
                            return <ContactRenderer key={section.id} data={section as ContactCTASection} />;
                        default:
                            return null;
                    }
                })}
            </main>
            <BrandFooter />
        </div>
    );
};

// --- Renderers ---

const HeroRenderer: React.FC<{ data: ServicesHeroSection }> = ({ data }) => {
    return (
        <section className="relative w-full h-[500px] flex items-center justify-center bg-gray-900 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center max-w-4xl px-6">
                <h3 className="text-cyan-400 font-bold uppercase tracking-widest mb-3">{data.title}</h3>
                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                    {data.headline}
                </h1>
                <p className="text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
                    {data.description}
                </p>
            </div>
        </section>
    );
};

const ServiceBlockRenderer: React.FC<{ data: ServiceBlockSection; isImageLeft: boolean }> = ({ data, isImageLeft }) => {
    return (
        <section className={`py-20 px-6 md:px-12 lg:px-24 ${isImageLeft ? 'bg-white' : 'bg-gray-50'}`}>
            <div className={`max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20 ${isImageLeft ? '' : 'md:flex-row-reverse'}`}>

                {/* Image Side */}
                <div className="w-full md:w-1/2">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[400px] group">
                        <img
                            src={data.imageUrl}
                            alt={data.serviceTitle}
                            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-colors duration-300" />
                    </div>
                </div>

                {/* Text Side */}
                <div className="w-full md:w-1/2 space-y-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                        {data.serviceTitle}
                    </h2>
                    <div
                        className="text-lg text-gray-600 leading-relaxed space-y-4"
                        dangerouslySetInnerHTML={{ __html: data.description.replace(/\n/g, '<br/>') }}
                    />

                    <div className="pt-4">
                        <a
                            href={data.ctaLink}
                            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                        >
                            {data.ctaLabel}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

const ContactRenderer: React.FC<{ data: ContactCTASection }> = ({ data }) => {
    return (
        <section className="py-24 px-6 bg-blue-900 text-white text-center">
            <div className="max-w-4xl mx-auto space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold">{data.title}</h2>
                <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                    {data.text}
                </p>
                <div className="pt-4">
                    <a
                        href={data.ctaLink}
                        className="inline-block px-10 py-4 text-lg font-bold text-blue-900 bg-white rounded-full hover:bg-blue-50 transition-colors shadow-xl"
                    >
                        {data.ctaLabel}
                    </a>
                </div>
            </div>
        </section>
    );
};
