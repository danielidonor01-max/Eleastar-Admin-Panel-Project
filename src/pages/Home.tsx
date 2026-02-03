import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { StickyHeader } from '../components/StickyHeader';
import { BrandFooter } from '../components/BrandFooter';
import { Link } from 'react-router-dom';
import { ArrowRight, Smartphone, Shield } from 'lucide-react';
import type { HeroSection, AboutSection, ServicesSection, KnowMoreSection, ApproachSection, NewestTechSection, ContactSection, NewsSection, CEOQuoteSection } from '../data/mockData';

// --- Section Components ---

const HeroRenderer: React.FC<{ data: HeroSection }> = ({ data }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % data.cards.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [data.cards.length]);

    const card = data.cards[activeIndex];

    return (
        <section className="relative h-[600px] md:h-[700px] overflow-hidden bg-slate-900 text-white">
            <div className="absolute inset-0">
                <img
                    src={card.imageUrl}
                    alt="Hero Config"
                    className="w-full h-full object-cover opacity-40 transition-opacity duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
            </div>

            <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">
                <div className="max-w-2xl animate-in slide-in-from-left duration-700">
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
                        {card.headline}
                    </h1>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        {card.subheadline}
                    </p>
                    <Link
                        to={card.ctaLink}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-white text-slate-900 rounded-full font-bold hover:bg-brand-50 transition-colors"
                    >
                        {card.ctaLabel} <ArrowRight size={20} />
                    </Link>
                </div>

                {/* Slider Indicators */}
                {data.cards.length > 1 && (
                    <div className="absolute bottom-12 left-6 right-6 flex gap-3">
                        {data.cards.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveIndex(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex ? 'w-12 bg-white' : 'w-4 bg-white/30'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

const AboutRenderer: React.FC<{ data: AboutSection }> = ({ data }) => (
    <section className="py-20 bg-brand-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
                <img src={data.imageUrl} alt="About Us" className="rounded-2xl shadow-2xl border border-white/10" />
            </div>
            <div className="md:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">{data.title}</h2>
                <p className="text-lg text-slate-300 mb-8 leading-relaxed">{data.text}</p>
                <Link to={data.ctaLink} className="px-6 py-2.5 bg-white/10 border border-white/20 rounded-full hover:bg-white hover:text-brand-900 transition-all font-medium inline-block">
                    {data.ctaLabel}
                </Link>
            </div>
        </div>
    </section>
);

const ServicesRenderer: React.FC<{ data: ServicesSection }> = ({ data }) => (
    <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mb-12">
                <h2 className="text-3xl font-bold text-slate-900">{data.title}</h2>
                <p className="text-xl text-brand-600 font-medium">{data.subtitle}</p>
            </div>

            <div className="space-y-4">
                {data.services.map(service => (
                    <div key={service.id} className="group border-b border-slate-200 py-6 flex justify-between items-center hover:bg-slate-50 px-4 -mx-4 rounded-lg transition-colors cursor-pointer">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{service.title}</h3>
                            <p className="text-slate-500 mt-1">{service.description}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-brand-600 group-hover:text-brand-600 transition-colors">
                            <ArrowRight size={16} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10">
                <Link to={data.ctaLink} className="inline-flex items-center gap-2 text-brand-700 font-bold hover:gap-3 transition-all">
                    {data.ctaLabel} <ArrowRight size={20} />
                </Link>
            </div>
        </div>
    </section>
);

const KnowMoreRenderer: React.FC<{ data: KnowMoreSection }> = ({ data }) => (
    <section className="py-24 bg-slate-900 text-white relative">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <div>
                <span className="text-brand-400 font-bold tracking-wider uppercase text-sm mb-2 block">{data.title}</span>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-6">{data.highlight}</h2>
                <p className="text-lg text-slate-400 mb-8">{data.description}</p>
                <Link to={data.ctaLink} className="px-8 py-3 bg-brand-600 rounded-full font-bold hover:bg-brand-500 transition-colors inline-block">
                    {data.ctaLabel}
                </Link>
            </div>
            <div className="relative">
                <div className="absolute -inset-4 bg-brand-500/20 rounded-full blur-3xl" />
                <img src={data.imageUrl} alt="Know More" className="relative rounded-2xl shadow-2xl skew-y-3 transform hover:skew-y-0 transition-transform duration-700" />
            </div>
        </div>
    </section>
);

const ApproachRenderer: React.FC<{ data: ApproachSection }> = ({ data }) => (
    <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
                <h2 className="text-3xl font-bold text-slate-900">{data.title}</h2>
                <p className="text-xl text-brand-600 font-medium">{data.subtitle}</p>
            </div>

            <div className="space-y-6">
                {data.steps.map((step, idx) => (
                    <div key={step.id} className="flex gap-6 items-start group">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-400 group-hover:border-brand-500 group-hover:text-brand-600 transition-colors shadow-sm">
                            {idx + 1}
                        </div>
                        <div className="pt-2 border-b border-slate-200 pb-6 flex-grow">
                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-700 transition-colors">{step.title}</h3>
                            {step.description && <p className="text-slate-500 mt-2">{step.description}</p>}
                        </div>
                        <div className="pt-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight size={20} />
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-12">
                <Link to={data.ctaLink} className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors">
                    {data.ctaLabel}
                </Link>
            </div>
        </div>
    </section>
);

const NewestTechRenderer: React.FC<{ data: NewestTechSection }> = ({ data }) => (
    <section className="py-24 bg-brand-900 text-white relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-800/50 skew-x-12 translate-x-1/4" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2">
                <h2 className="text-4xl font-extrabold mb-2">{data.title}</h2>
                <p className="text-3xl text-brand-400 font-bold mb-6">{data.subtitle}</p>
                <p className="text-slate-300 text-lg mb-10">{data.description}</p>

                <div className="flex flex-wrap gap-4">
                    {data.showIOS && (
                        <button className="flex items-center gap-3 px-5 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-colors">
                            <div className="p-1 bg-black rounded-full text-white"><Smartphone size={16} /></div>
                            App Store
                        </button>
                    )}
                    {data.showAndroid && (
                        <button className="flex items-center gap-3 px-5 py-3 bg-white/10 text-white border border-white/20 rounded-xl font-bold hover:bg-white/20 transition-colors">
                            <div className="p-1 bg-green-500 rounded-full text-white"><Smartphone size={16} /></div>
                            Play Store
                        </button>
                    )}
                </div>

                <div className="mt-8">
                    <Link to={data.ctaLink} className="text-sm font-bold text-brand-300 hover:text-white transition-colors flex items-center gap-2">
                        {data.ctaLabel} <ArrowRight size={14} />
                    </Link>
                </div>
            </div>

            <div className="md:w-1/2">
                <img src={data.imageUrl} alt="App Interface" className="rounded-3xl shadow-2xl border-4 border-slate-800 rotate-3 hover:rotate-0 transition-transform duration-500" />
            </div>
        </div>
    </section>
);

const ContactRenderer: React.FC<{ data: ContactSection }> = ({ data }) => (
    <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{data.title}</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-brand-600 mb-6">{data.subtitle}</h3>
            <p className="text-xl text-slate-600 mb-10">{data.intro}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-left">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100"><span className="block text-xs font-bold text-slate-400 mb-1">Service Interest</span><div className="h-2 w-full bg-slate-200 rounded animate-pulse" /></div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100"><span className="block text-xs font-bold text-slate-400 mb-1">Your Name</span><div className="h-2 w-full bg-slate-200 rounded animate-pulse" /></div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100"><span className="block text-xs font-bold text-slate-400 mb-1">Email Address</span><div className="h-2 w-full bg-slate-200 rounded animate-pulse" /></div>
                <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold">Start Project</button>
            </div>

            <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
                <Shield size={14} /> {data.privacyText}
            </p>
        </div>
    </section>
);

const NewsRenderer: React.FC<{ data: NewsSection }> = ({ data }) => (
    <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
                <h2 className="text-3xl font-bold">{data.title} <span className="text-brand-400">News</span></h2>
                <Link to={data.ctaLink} className="text-sm font-bold text-slate-400 hover:text-white transition-colors">{data.ctaLabel}</Link>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {data.newsItems.map(item => (
                    <Link key={item.id} to={item.link} className="group relative block overflow-hidden rounded-2xl aspect-[4/3] md:aspect-[16/9]">
                        <img src={item.imageUrl} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8 flex flex-col justify-end">
                            <span className="inline-block px-3 py-1 bg-brand-600 text-white text-xs font-bold rounded-full mb-3 w-max">{item.category}</span>
                            <h3 className="text-2xl font-bold mb-2 group-hover:text-brand-400 transition-colors">{item.title}</h3>
                            <p className="text-slate-300 line-clamp-2">{item.summary}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    </section>
);

const CEOQuoteRenderer: React.FC<{ data: CEOQuoteSection }> = ({ data }) => (
    <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
            <div className="bg-brand-900 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
                <div className="relative z-10 md:w-2/3">
                    <div className="text-brand-400 mb-6 font-serif text-6xl opacity-50">"</div>
                    <blockquote className="text-xl md:text-2xl font-medium text-white leading-relaxed mb-8">
                        {data.quote}
                    </blockquote>
                    <div>
                        <div className="font-bold text-white text-lg">{data.authorName}</div>
                        <div className="text-brand-300">{data.authorTitle}</div>
                    </div>
                </div>
                <div className="md:w-1/3 relative z-10">
                    <img src={data.imageUrl} alt="CEO" className="w-48 h-48 rounded-full border-4 border-white/10 object-cover shadow-xl mx-auto md:mx-0" />
                </div>
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-800 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            </div>
            <div className="text-center mt-12">
                <h2 className="text-2xl font-bold text-slate-900">{data.title}</h2>
            </div>
        </div>
    </section>
);

// --- Main Page Component ---

export const Home: React.FC = () => {
    const { cmsContent } = useAdmin();

    // Sort sections by order
    const sections = [...cmsContent].sort((a, b) => a.order - b.order);

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <StickyHeader />
            <main className="flex-grow w-full">
                {sections.filter(s => s.page === 'Home' && s.isVisible).map(section => {
                    switch (section.type) {
                        case 'Hero': return <HeroRenderer key={section.id} data={section as HeroSection} />;
                        case 'About': return <AboutRenderer key={section.id} data={section as AboutSection} />;
                        case 'Services': return <ServicesRenderer key={section.id} data={section as ServicesSection} />;
                        case 'KnowMore': return <KnowMoreRenderer key={section.id} data={section as KnowMoreSection} />;
                        case 'Approach': return <ApproachRenderer key={section.id} data={section as ApproachSection} />;
                        case 'NewestTech': return <NewestTechRenderer key={section.id} data={section as NewestTechSection} />;
                        case 'Contact': return <ContactRenderer key={section.id} data={section as ContactSection} />;
                        case 'News': return <NewsRenderer key={section.id} data={section as NewsSection} />;
                        case 'CEOQuote': return <CEOQuoteRenderer key={section.id} data={section as CEOQuoteSection} />;
                        default: return null;
                    }
                })}
            </main>
            <BrandFooter />
        </div>
    );
};
