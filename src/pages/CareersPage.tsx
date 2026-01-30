import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { BookOpen, Briefcase, ChevronRight, GraduationCap, Globe, Users, TrendingUp } from 'lucide-react';
import { BrandFooter } from '../components/BrandFooter';

export const CareersPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            {/* Navigation / Header */}
            <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                    <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
                        <Globe size={18} />
                    </div>
                    Eleastar
                </div>
                <div className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
                    <a href="#" className="hover:text-brand-600">Solutions</a>
                    <a href="#" className="hover:text-brand-600">About</a>
                    <a href="#" className="text-brand-600">Careers</a>
                </div>
                <button className="hidden md:block px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
                    Contact Us
                </button>
            </nav>

            {/* Hero Section */}
            <CMSCareersHero />

            {/* Split Pathways Section */}
            <section className="px-6 pb-20 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8">

                    {/* Card A: Tech Hub */}
                    <div className="group relative bg-brand-50 rounded-3xl p-8 md:p-12 transition-all hover:shadow-xl hover:shadow-brand-900/5 border border-brand-100 flex flex-col items-start overflow-hidden">
                        {/* Decorative blob */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-brand-200/50 transition-colors duration-500" />

                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-xs font-bold text-brand-700 uppercase tracking-wider mb-6 shadow-sm z-10">
                            <GraduationCap size={14} />
                            Government Partnership
                        </div>

                        <h2 className="text-3xl font-bold mb-4 relative z-10">Eleastar Tech Hub</h2>
                        <p className="text-slate-600 text-lg mb-8 leading-relaxed relative z-10">
                            A government-backed initiative to train the next generation of tech talent. Get certified, get mentored, and get noticed by top employers.
                        </p>

                        <div className="mt-auto relative z-10">
                            <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wide">Perfect For:</h3>
                            <ul className="space-y-3 mb-8">
                                {['Students & Graduates', 'Career Switchers', 'Aspiring Developers'].map((item) => (
                                    <li key={item} className="flex items-center gap-2 text-slate-700">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <button className="w-full md:w-auto px-8 py-4 bg-white border-2 border-brand-600 text-brand-700 font-bold rounded-xl hover:bg-brand-50 transition-colors flex items-center justify-center gap-2">
                                <BookOpen size={20} />
                                Apply for Cohort 4
                            </button>
                        </div>
                    </div>

                    {/* Card B: Work at Eleastar */}
                    <div className="group relative bg-slate-900 rounded-3xl p-8 md:p-12 transition-all hover:shadow-2xl hover:shadow-slate-900/20 flex flex-col items-start overflow-hidden text-white">
                        {/* Decorative blob */}
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-800/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full text-xs font-bold text-slate-300 uppercase tracking-wider mb-6 border border-slate-700 shadow-sm z-10">
                            <Briefcase size={14} />
                            Careers • Full-Time
                        </div>

                        <h2 className="text-3xl font-bold mb-4 relative z-10">Work at Eleastar</h2>
                        <p className="text-slate-300 text-lg mb-8 leading-relaxed relative z-10">
                            Join our world-class team building enterprise ERPs, AI solutions, and digital infrastructure for the continent.
                        </p>

                        <div className="mt-auto relative z-10 w-full">
                            <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wide">Roles Available:</h3>
                            <ul className="space-y-3 mb-8">
                                {['Senior Frontend Engineers', 'Product Designers', 'Cloud Architects'].map((item) => (
                                    <li key={item} className="flex items-center gap-2 text-slate-200">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <button className="w-full md:w-auto px-8 py-4 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-900/20">
                                <Briefcase size={20} />
                                View Open Roles
                            </button>
                        </div>
                    </div>

                </div>
            </section>

            {/* Why Choose Eleastar */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold mb-4">Why Grow With Us?</h2>
                        <p className="text-slate-600">The best place to learn, build, and scale your career.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <TrendingUp className="text-brand-600" size={32} />,
                                title: "Accelerated Growth",
                                desc: "From the Tech Hub to Tech Lead—we structure our company to promote from within and reward clear impact."
                            },
                            {
                                icon: <Globe className="text-brand-600" size={32} />,
                                title: "Real-World Impact",
                                desc: "Don't just build widgets. Build systems that power national infrastructure and serve millions of users."
                            },
                            {
                                icon: <Users className="text-brand-600" size={32} />,
                                title: "World-Class Mentorship",
                                desc: "Work alongside veterans from global tech giants who are dedicated to raising the bar for African tech."
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Application Flow */}
            <section className="py-20 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Simple Application Process</h2>
                            <p className="text-slate-600 text-lg mb-8">
                                We value transparency. Here is how we move from "Hello" to Hired.
                            </p>

                            <div className="space-y-8">
                                {[
                                    { step: "01", title: "Choose Your Path", desc: "Select either the Tech Hub (Training) or a Full-time Role." },
                                    { step: "02", title: "Assessment", desc: "A practical skills test relevant to your level. No whiteboard puzzles." },
                                    { step: "03", title: "Culture Fit", desc: "Meet the team and see if our values align with yours." },
                                    { step: "04", title: "Offer & Onboarding", desc: "Welcome to the team! We start with a comprehensive 2-week bootcamp." }
                                ].map((s) => (
                                    <div key={s.step} className="flex gap-6">
                                        <div className="text-2xl font-bold text-brand-200">{s.step}</div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 mb-1">{s.title}</h4>
                                            <p className="text-slate-500 text-sm">{s.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="hidden md:block bg-slate-100 rounded-3xl h-full min-h-[500px] flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-slate-200 opacity-50" />
                            <div className="relative text-center p-8">
                                <div className="inline-block p-4 bg-white rounded-2xl shadow-xl mb-4 transform -rotate-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                            <ChevronRight />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xs text-slate-500 font-bold uppercase">Status</div>
                                            <div className="font-bold text-slate-900">Application Received</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="inline-block p-4 bg-white rounded-2xl shadow-xl transform rotate-3 translate-x-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
                                            <Users size={18} />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xs text-slate-500 font-bold uppercase">Next Step</div>
                                            <div className="font-bold text-slate-900">Team Interview</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Footer Strip */}
            <div className="bg-slate-900 border-b border-slate-800 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div className="text-slate-400 text-sm max-w-md">
                        <strong className="text-white block mb-1">Government Accredited</strong>
                        Our Tech Hub is a recognized partner of the National Information Technology Development Agency.
                    </div>
                    <div className="flex items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all">
                        {/* Placeholder Logos */}
                        <div className="h-8 w-24 bg-white/10 rounded"></div>
                        <div className="h-8 w-24 bg-white/10 rounded"></div>
                        <div className="h-8 w-24 bg-white/10 rounded"></div>
                    </div>
                </div>
            </div>

            <BrandFooter />
        </div>
    );
};

const CMSCareersHero: React.FC = () => {
    const { cmsContent } = useAdmin();
    const heroContent = cmsContent.find(c => c.id === 'careers-hero') as any;

    if (!heroContent) return (
        <header className="px-6 py-16 md:py-24 max-w-7xl mx-auto text-center md:text-left">
            <h1 className="text-4xl font-bold mb-4">Careers at Eleastar</h1>
        </header>
    );

    return (
        <header className="px-6 py-16 md:py-24 max-w-7xl mx-auto text-center md:text-left relative overflow-hidden">
            {heroContent.imageUrl && (
                <div className="absolute inset-0 z-0 opacity-10">
                    <img src={heroContent.imageUrl} className="w-full h-full object-cover" alt="Hero Background" />
                </div>
            )}
            <div className="max-w-3xl relative z-10">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
                    {heroContent.title}
                </h1>
                <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl">
                    {heroContent.body}
                </p>
            </div>
        </header>
    );
};
