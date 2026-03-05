import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { StickyHeader } from '../components/StickyHeader';
import { BrandFooter } from '../components/BrandFooter';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { CMSHomeHeroCardData } from '../types/cms';
import { ContactUsCard } from '../components/cms/ContactUsCard';

const HeroRenderer: React.FC<{ cards: CMSHomeHeroCardData[] }> = ({ cards }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (!cards || cards.length <= 1) return;
        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % cards.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [cards]);

    if (!cards || cards.length === 0) return null;

    const card = cards[activeIndex];

    return (
        <section className={`relative h-[80vh] min-h-[600px] flex items-center overflow-hidden ${card.backgroundColor || 'bg-slate-900'}`}>
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/60 z-10" />
                <img
                    src={card.cardImages.mainImage.url}
                    alt={card.cardImages.mainImage.alt || 'Hero'}
                    className="w-full h-full object-cover animate-pulse-slow"
                    style={{ animationDuration: '10s' }}
                />
            </div>

            <div className="relative z-20 max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row items-center gap-12">
                <div className={`max-w-2xl p-8 rounded-2xl shadow-2xl backdrop-blur-md border border-white/10 ${card.cardColor || 'bg-black/40'} text-white`}>
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 animate-in slide-in-from-bottom-4 duration-700">
                        {card.cardTitle}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-200 mb-8 leading-relaxed animate-in slide-in-from-bottom-8 duration-1000">
                        {card.cardDescription}
                    </p>
                    <div className="flex gap-4 animate-in slide-in-from-bottom-12 duration-1000 delay-200">
                        {card.button && (
                            <Link
                                to={card.button.link}
                                className={`px-8 py-4 rounded-full font-bold transition-all flex items-center gap-2 ${card.button.backgroundColor} ${card.button.color} hover:opacity-90 hover:shadow-lg`}
                            >
                                {card.button.text} <ArrowRight size={20} />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Sub Images Configuration from CMS */}
                <div className="hidden md:flex gap-4 relative z-20 h-96 items-center">
                    {card.cardImages.subImage1 && (
                        <div className={`w-48 h-64 rounded-xl overflow-hidden shadow-2xl skew-y-6 ${card.cardImages.subCardColor}`}>
                            <img src={card.cardImages.subImage1.url} alt="Sub 1" className="w-full h-full object-cover opacity-80" />
                        </div>
                    )}
                    {card.cardImages.subImage2 && (
                        <div className={`w-48 h-64 rounded-xl overflow-hidden shadow-2xl -skew-y-6 -translate-y-12 ${card.cardImages.subCardColor}`}>
                            <img src={card.cardImages.subImage2.url} alt="Sub 2" className="w-full h-full object-cover opacity-80" />
                        </div>
                    )}
                </div>
            </div>

            {/* Slider Indicators */}
            {cards.length > 1 && (
                <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center gap-3">
                    {cards.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex ? 'w-12 bg-white' : 'w-4 bg-white/30'}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};




export const Home: React.FC = () => {
    const { cmsContent } = useCMS();
    // Assuming useAdmin isn't used for anything else. Wait, let's keep it safe.
    // If it was just `const { cmsContent } = useAdmin();`, this is fine.

    const homeData = cmsContent?.pages?.home;
    const globalContactData = cmsContent?.contactUsCardData;

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-brand-200">
            <StickyHeader />
            <main className="flex-grow w-full">
                {homeData?.heroCardData && <HeroRenderer cards={homeData.heroCardData} />}

                {/* Due to Schema structure, Home exclusively features Hero Data. 
                    We add the generic ContactUsCard at the bottom for completeness. */}
                {globalContactData && <ContactUsCard data={globalContactData} />}
            </main>
            <BrandFooter />
        </div>
    );
};
