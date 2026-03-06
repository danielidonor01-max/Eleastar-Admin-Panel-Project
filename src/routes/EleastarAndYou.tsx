import React from 'react';
import { StickyHeader } from '../components/StickyHeader';
import { BrandFooter } from '../components/BrandFooter';
import { PageSEO } from '../components/cms/PageSEO';

export const EleastarAndYou: React.FC = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <PageSEO slug="eleastar-and-you" />
            <StickyHeader />
            <main className="grow w-full max-w-7xl mx-auto px-6 py-20">
                <h1 className="text-4xl font-bold mb-6">Eleastar & You</h1>
                <p className="text-lg text-slate-600">
                    Discover how we can grow together.
                </p>
                {/* Content placeholder */}
                <div className="mt-12 p-8 bg-brand-50 rounded-2xl">
                    <h2 className="text-2xl font-bold mb-4">Culture & Careers</h2>
                    <p className="text-slate-700">
                        At Eleastar, we believe in empowering our people. Join a team that values innovation, collaboration, and growth.
                    </p>
                </div>
            </main>
            <BrandFooter />
        </div>
    );
};
