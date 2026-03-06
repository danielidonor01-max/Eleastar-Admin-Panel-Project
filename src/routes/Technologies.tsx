import React from 'react';
import { StickyHeader } from '../components/StickyHeader';
import { BrandFooter } from '../components/BrandFooter';
import { PageSEO } from '../components/cms/PageSEO';

export const Technologies: React.FC = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <PageSEO slug="technologies" />
            <StickyHeader />
            <main className="grow w-full max-w-7xl mx-auto px-6 py-20">
                <h1 className="text-4xl font-bold mb-6">Our Technologies</h1>
                <p className="text-lg text-slate-600">
                    Explore the cutting-edge technologies we use to drive innovation.
                </p>
                {/* Content placeholder */}
                <div className="mt-12 grid md:grid-cols-3 gap-8">
                    {['Cloud Computing', 'AI & Machine Learning', 'IoT Solutions'].map((tech) => (
                        <div key={tech} className="p-6 border border-slate-200 rounded-xl hover:shadow-lg transition-shadow">
                            <h3 className="text-xl font-bold mb-2">{tech}</h3>
                            <p className="text-slate-500">Leveraging {tech} to build scalable solutions.</p>
                        </div>
                    ))}
                </div>
            </main>
            <BrandFooter />
        </div>
    );
};
