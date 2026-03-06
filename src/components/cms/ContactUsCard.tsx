import React from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import type { CMSContactUsCardData } from '../../types/cms';

export const ContactUsCard: React.FC<{ data: CMSContactUsCardData }> = ({ data }) => {
    if (!data) return null;
    return (
        <section className={`py-24 relative overflow-hidden bg-slate-50`} style={{ backgroundImage: `url(${data.backgroundImage})`, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
            <div className="absolute inset-0 bg-black/60 z-0" />
            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <div className={`p-12 rounded-3xl shadow-2xl ${data.cardColor || 'bg-brand-900'} backdrop-blur-xl border border-white/20`}>
                    <h2 className={`text-5xl font-extrabold mb-6 ${data.titleColor || 'text-white'}`}>{data.title}</h2>
                    <p className={`text-xl mb-10 max-w-2xl mx-auto ${data.textColor || 'text-slate-200'}`}>{data.description}</p>

                    {data.button && (
                        <Link
                            to={data.button.link}
                            className={`inline-flex items-center gap-3 px-10 py-5 rounded-full font-bold text-lg transition-all shadow-xl hover:-translate-y-1 ${data.button.backgroundColor} ${data.button.color} hover:brightness-110`}
                        >
                            {data.button.text}
                            <ArrowRight size={20} />
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
};
