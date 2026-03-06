import React from 'react';
import { useCMS } from '../context/CMSContext';
import { StickyHeader } from '../components/StickyHeader';
import { BrandFooter } from '../components/BrandFooter';
import type { CMSServicesListData, CMSServiceItemData } from '../types/cms';
import { ContactUsCard } from '../components/cms/ContactUsCard';
import { PageSEO } from '../components/cms/PageSEO';

const ServiceListHero: React.FC<{ data: CMSServicesListData }> = ({ data }) => {
    return (
        <section className="relative w-full h-[500px] flex items-center justify-center bg-slate-900 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img src={data.bannerImage} alt={data.bannerImageAlt || data.title} className="w-full h-full object-cover opacity-50" />
                <div className="absolute inset-0 bg-linear-to-b from-transparent to-slate-900/90" />
            </div>

            <div className="relative z-10 text-center max-w-4xl px-6">
                <h3 className="text-brand-400 font-bold uppercase tracking-widest mb-3">Our Services</h3>
                <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                    {data.title}
                </h1>
                <p className="text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed">
                    {data.description}
                </p>
            </div>
        </section>
    );
};

const ServiceContentBlock: React.FC<{ data: CMSServiceItemData; isImageLeft: boolean }> = ({ data, isImageLeft }) => {
    return (
        <section className={`py-20 px-6 md:px-12 lg:px-24 ${isImageLeft ? 'bg-white' : 'bg-slate-50'}`}>
            <div className={`max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20 ${isImageLeft ? '' : 'md:flex-row-reverse'}`}>
                <div className="w-full md:w-1/2">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[400px] group">
                        <img
                            src={data.image}
                            alt={data.imageAlt || `${data.TextTitle1} ${data.TextTitle2}`}
                            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-brand-900/10 group-hover:bg-transparent transition-colors duration-300" />
                    </div>
                </div>

                <div className="w-full md:w-1/2 space-y-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                        {data.TextTitle1} <span className="text-brand-600">{data.TextTitle2}</span>
                    </h2>
                    <div
                        className="text-lg text-slate-600 leading-relaxed space-y-4"
                        dangerouslySetInnerHTML={{ __html: data.TextDescription.replace(/\n/g, '<br/>') }}
                    />
                </div>
            </div>
        </section>
    );
};

export const Services: React.FC = () => {
    const { cmsContent } = useCMS();

    const servicesListData = cmsContent?.pages?.services?.servicesListData || [];
    const globalContactData = cmsContent?.contactUsCardData;

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col">
            <PageSEO slug="services" />
            <StickyHeader />
            <main className="grow w-full">
                {servicesListData.map((serviceGroup, idx) => (
                    <div key={idx}>
                        <ServiceListHero data={serviceGroup} />
                        {serviceGroup.servicesContent && serviceGroup.servicesContent.map((block, bIdx) => {
                            const isImageLeft = bIdx % 2 === 0;
                            return <ServiceContentBlock key={bIdx} data={block} isImageLeft={isImageLeft} />
                        })}
                    </div>
                ))}

                {globalContactData && <ContactUsCard data={globalContactData} />}
            </main>
            <BrandFooter />
        </div>
    );
};
