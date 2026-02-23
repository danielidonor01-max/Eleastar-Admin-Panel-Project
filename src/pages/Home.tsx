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
        <section className="relative h-[80vh] min-h-[600px] flex items-center bg-slate-900 text-white overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/60 z-10" />
                <img
                    src={card.imageUrl}
                    alt="Hero"
                    className="w-full h-full object-cover animate-pulse-slow"
                    style={{ animationDuration: '10s' }}
                />
            </div>

            <div className="relative z-20 max-w-7xl mx-auto px-6 w-full">
                <div className="max-w-3xl">
                    <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 animate-in slide-in-from-bottom-4 duration-700">
                        {card.headline}
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-200 mb-10 leading-relaxed max-w-2xl animate-in slide-in-from-bottom-8 duration-1000">
                        {card.subheadline}
                    </p>
                    <div className="flex gap-4 animate-in slide-in-from-bottom-12 duration-1000 delay-200">
                        <Link
                            to={card.ctaLink}
                            className="px-8 py-4 bg-brand-600 text-white rounded-full font-bold hover:bg-brand-500 transition-all flex items-center gap-2"
                        >
                            {card.ctaLabel} <ArrowRight size={20} />
                        </Link>
                        <Link
                            to="/services"
                            className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-full font-bold hover:bg-white/20 transition-all backdrop-blur-sm"
                        >
                            Our Services
                        </Link>
                    </div>
                </div>
            </div>

            {/* Slider Indicators */}
            {data.cards.length > 1 && (
                <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center gap-3">
                    {data.cards.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex ? 'w-12 bg-brand-500' : 'w-4 bg-white/30'}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

const AboutRenderer: React.FC<{ data: AboutSection }> = ({ data }) => (
    <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
                <div className="relative">
                    <div className="absolute -inset-4 bg-brand-100 rounded-3xl -rotate-2" />
                    <img src={data.imageUrl} alt="About Us" className="relative rounded-2xl shadow-xl w-full object-cover aspect-[4/3]" />
                </div>
            </div>
            <div className="order-1 md:order-2">
                <span className="text-brand-600 font-bold tracking-wider uppercase text-sm mb-2 block">Who We Are</span>
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">{data.title}</h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">{data.text}</p>
                <Link to={data.ctaLink} className="inline-flex items-center gap-2 text-brand-700 font-bold hover:gap-3 transition-all border-b-2 border-brand-200 pb-1">
                    {data.ctaLabel} <ArrowRight size={20} />
                </Link>
            </div>
        </div>
    </section>
);

const ServicesRenderer: React.FC<{ data: ServicesSection }> = ({ data }) => (
    <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">{data.title}</h2>
                <p className="text-xl text-brand-600 font-medium">{data.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.services.map((service, idx) => (
                    <Link key={service.id} to={`/services`} className={`group bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${idx === 0 || idx === 3 ? 'md:col-span-2 lg:col-span-1' : ''}`}>
                        <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                            <Shield size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors">{service.title}</h3>
                        <p className="text-slate-500 leading-relaxed mb-6">{service.description}</p>
                        <div className="flex items-center text-sm font-bold text-brand-600 gap-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                            Learn more <ArrowRight size={16} />
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-16 text-center">
                <Link to={data.ctaLink} className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl">
                    {data.ctaLabel} <ArrowRight size={20} />
                </Link>
            </div>
        </div>
    </section>
);

const KnowMoreRenderer: React.FC<{ data: KnowMoreSection }> = ({ data }) => (
    <section className="py-24 bg-brand-900 text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
            <div>
                <span className="text-brand-400 font-bold tracking-wider uppercase text-sm mb-2 block">{data.title}</span>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">{data.highlight}</h2>
                <p className="text-lg text-slate-300 mb-10 leading-relaxed">{data.description}</p>
                <Link to={data.ctaLink} className="px-8 py-4 bg-white text-brand-900 rounded-full font-bold hover:bg-brand-50 transition-colors inline-flex items-center gap-2 shadow-lg">
                    {data.ctaLabel} <ArrowRight size={18} />
                </Link>
            </div>
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-600/30 to-transparent rounded-2xl z-10" />
                <img src={data.imageUrl} alt="Know More" className="relative rounded-2xl shadow-2xl skew-y-2 hover:skew-y-0 transition-transform duration-700 bg-slate-800" />
            </div>
        </div>
    </section>
);

const ApproachRenderer: React.FC<{ data: ApproachSection }> = ({ data }) => (
    <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16 md:w-2/3">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">{data.title}</h2>
                <p className="text-xl text-brand-600 font-medium">{data.subtitle}</p>
            </div>

            <div className="relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-12 left-6 right-6 h-0.5 bg-slate-100" />

                <div className="grid md:grid-cols-5 gap-8">
                    {data.steps.map((step, idx) => (
                        <div key={step.id} className="relative group">
                            <div className="w-24 h-24 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center text-2xl font-bold text-slate-300 mb-6 relative z-10 group-hover:border-brand-500 group-hover:text-brand-600 group-hover:shadow-lg transition-all duration-300">
                                {idx + 1}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-brand-700 transition-colors h-14">{step.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-16">
                <Link to={data.ctaLink} className="text-brand-600 font-bold hover:text-brand-800 transition-colors flex items-center gap-2">
                    {data.ctaLabel} <ArrowRight size={20} />
                </Link>
            </div>
        </div>
    </section>
);

const NewestTechRenderer: React.FC<{ data: NewestTechSection }> = ({ data }) => (
    <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-16">
                <div className="md:w-1/2 order-2 md:order-1">
                    <img src={data.imageUrl} alt="App Interface" className="rounded-[2.5rem] shadow-2xl border-8 border-slate-800 bg-slate-800 mx-auto max-w-sm w-full" />
                </div>
                <div className="md:w-1/2 order-1 md:order-2">
                    <h2 className="text-4xl font-extrabold mb-2">{data.title}</h2>
                    <p className="text-3xl text-brand-400 font-bold mb-6">{data.subtitle}</p>
                    <p className="text-slate-400 text-lg mb-10 leading-relaxed">{data.description}</p>

                    <div className="flex flex-wrap gap-4">
                        {data.showIOS && (
                            <button className="flex items-center gap-3 px-6 py-3.5 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all hover:-translate-y-1">
                                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white"><Smartphone size={16} /></div>
                                <div className="text-left">
                                    <div className="text-[10px] uppercase font-bold text-slate-500">Download on the</div>
                                    <div className="text-sm leading-none">App Store</div>
                                </div>
                            </button>
                        )}
                        {data.showAndroid && (
                            <button className="flex items-center gap-3 px-6 py-3.5 bg-white/10 text-white border border-white/20 rounded-xl font-bold hover:bg-white/20 transition-all hover:-translate-y-1">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white"><Smartphone size={16} /></div>
                                <div className="text-left">
                                    <div className="text-[10px] uppercase font-bold text-slate-400">Get it on</div>
                                    <div className="text-sm leading-none">Google Play</div>
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const ContactRenderer: React.FC<{ data: ContactSection }> = ({ data }) => (
    <section className="py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{data.title}</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-brand-600 mb-8">{data.subtitle}</h3>
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">{data.intro}</p>

            <Link
                to="/contact"
                className="inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 hover:-translate-y-1"
            >
                Start a Project
                <ArrowRight size={20} />
            </Link>

            <div className="mt-12 pt-12 border-t border-slate-100">
                <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
                    <Shield size={14} /> {data.privacyText}
                </p>
            </div>
        </div>
    </section>
);

const NewsRenderer: React.FC<{ data: NewsSection }> = ({ data }) => (
    <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
                <h2 className="text-3xl font-extrabold text-slate-900">{data.title} <span className="text-brand-600">News</span></h2>
                <Link to={data.ctaLink} className="text-sm font-bold text-slate-500 hover:text-brand-600 transition-colors flex items-center gap-1">
                    {data.ctaLabel} <ArrowRight size={14} />
                </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.newsItems.map(item => (
                    <Link key={item.id} to={item.link} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-slate-100">
                        <div className="relative aspect-[16/9] overflow-hidden">
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute top-4 left-4">
                                <span className="px-3 py-1 bg-white/90 backdrop-blur text-slate-900 text-xs font-bold rounded-full">{item.category}</span>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors line-clamp-2">{item.title}</h3>
                            <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-grow">{item.summary}</p>
                            <div className="text-brand-600 font-bold text-sm flex items-center gap-2">
                                Read Article <ArrowRight size={14} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    </section>
);

const CEOQuoteRenderer: React.FC<{ data: CEOQuoteSection }> = ({ data }) => (
    <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
            <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center gap-16 shadow-2xl">
                {/* Quote Mark */}
                <div className="absolute top-8 left-10 text-brand-600 opacity-20 font-serif text-[10rem] leading-none select-none pointer-events-none">"</div>

                <div className="relative z-10 md:w-3/5">
                    <blockquote className="text-2xl md:text-3xl font-medium text-white leading-relaxed mb-10 relative">
                        {data.quote}
                    </blockquote>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-0.5 bg-brand-500" />
                        <div>
                            <div className="font-bold text-white text-lg tracking-wide">{data.authorName}</div>
                            <div className="text-slate-400 text-sm uppercase tracking-wider">{data.authorTitle}</div>
                        </div>
                    </div>
                </div>
                <div className="md:w-2/5 relative z-10 flex justify-center md:justify-end">
                    <img src={data.imageUrl} alt="CEO" className="w-64 h-64 rounded-full border-8 border-white/5 object-cover shadow-2xl" />
                </div>

                {/* Decoration */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-600/20 rounded-full blur-[100px]" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="text-center mt-12 opacity-40 hover:opacity-100 transition-opacity">
                <p className="text-sm font-bold text-slate-400">{data.title}</p>
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
        <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-brand-200">
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
