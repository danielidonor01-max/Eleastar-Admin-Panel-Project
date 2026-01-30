
import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { StickyHeader } from '../components/StickyHeader';
import { Link } from 'react-router-dom';
import { ArrowRight, Twitter, Linkedin } from 'lucide-react';
import type {
    AboutHeroSection,
    OurMissionSection,
    TeamNarrativeSection,
    MeetTeamSection,
    JoinTeamCTASection,
    ContactCTASection
} from '../data/mockData';

// --- Section Renderers ---

const AboutHeroRenderer: React.FC<{ data: AboutHeroSection }> = ({ data }) => (
    <section className="relative h-[500px] overflow-hidden bg-slate-900 text-white flex items-center">
        <div className="absolute inset-0">
            <img
                src={data.imageUrl}
                alt={data.title}
                className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-3xl animate-in slide-in-from-bottom duration-700">
                <span className="text-brand-400 font-bold tracking-wider uppercase mb-4 block">{data.subtitle}</span>
                <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">{data.title}</h1>
                <p className="text-xl text-slate-300 leading-relaxed">{data.description}</p>
            </div>
        </div>
    </section>
);

const OurMissionRenderer: React.FC<{ data: OurMissionSection }> = ({ data }) => (
    <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-12">
                <div className="relative pl-8 border-l-4 border-brand-500">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">{data.missionTitle}</h2>
                    <p className="text-lg text-slate-600 leading-relaxed">{data.missionText}</p>
                </div>
                <div className="relative pl-8 border-l-4 border-brand-300">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">{data.visionTitle}</h2>
                    <p className="text-lg text-slate-600 leading-relaxed">{data.visionText}</p>
                </div>
            </div>
            <div className="relative">
                <div className="absolute -inset-4 bg-brand-100 rounded-3xl -rotate-6" />
                <img
                    src={data.imageUrl}
                    alt="Mission"
                    className="relative rounded-2xl shadow-xl w-full object-cover aspect-[4/3]"
                />
            </div>
        </div>
    </section>
);

const TeamNarrativeRenderer: React.FC<{ data: TeamNarrativeSection }> = ({ data }) => (
    <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row-reverse items-center gap-16">
            <div className="md:w-1/2">
                <h2 className="text-3xl font-bold text-slate-900 mb-6">{data.title}</h2>
                <div className="prose prose-lg text-slate-600">
                    <p>{data.text}</p>
                </div>
            </div>
            <div className="md:w-1/2">
                <img
                    src={data.imageUrl}
                    alt="Team Narrative"
                    className="rounded-2xl shadow-lg w-full"
                />
            </div>
        </div>
    </section>
);

const MeetTeamRenderer: React.FC<{ data: MeetTeamSection }> = ({ data }) => (
    <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 mb-3">{data.title}</h2>
                <p className="text-xl text-slate-500">{data.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {data.members.map(member => (
                    <div key={member.id} className="group text-center">
                        <div className="relative mb-6 mx-auto w-64 h-64 rounded-full overflow-hidden border-4 border-slate-100 group-hover:border-brand-100 transition-colors">
                            <img
                                src={member.imageUrl}
                                alt={member.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
                        <p className="text-brand-600 font-medium mb-3">{member.role}</p>
                        {member.bio && <p className="text-slate-500 text-sm mb-4 px-4">{member.bio}</p>}

                        <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            {member.linkedinUrl && (
                                <a href={member.linkedinUrl} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-brand-600 transition-colors">
                                    <Linkedin size={18} />
                                </a>
                            )}
                            <button className="p-2 text-slate-400 hover:text-brand-600 transition-colors">
                                <Twitter size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const JoinTeamCTARenderer: React.FC<{ data: JoinTeamCTASection }> = ({ data }) => (
    <section className="relative py-32 bg-brand-900 text-white overflow-hidden">
        <div className="absolute inset-0">
            <img
                src={data.imageUrl}
                alt="Join Us"
                className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-brand-900/80" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-extrabold mb-6">{data.title}</h2>
            <p className="text-xl text-brand-100 mb-10 leading-relaxed max-w-2xl mx-auto">{data.text}</p>
            <Link
                to={data.ctaLink}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-900 rounded-full font-bold hover:bg-brand-50 transition-colors transform hover:-translate-y-1"
            >
                {data.ctaLabel} <ArrowRight size={20} />
            </Link>
        </div>
    </section>
);

const ContactCTARenderer: React.FC<{ data: ContactCTASection }> = ({ data }) => (
    <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 bg-white rounded-3xl p-12 shadow-xl border border-slate-100 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{data.title}</h2>
            <p className="text-lg text-slate-500 mb-8">{data.text}</p>
            <Link
                to={data.ctaLink}
                className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors"
            >
                {data.ctaLabel} <ArrowRight size={20} />
            </Link>
        </div>
    </section>
);

// --- Main About Page ---

export const About: React.FC = () => {
    const { cmsContent } = useAdmin();

    const sections = [...cmsContent].sort((a, b) => a.order - b.order);

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <StickyHeader />
            <main className="flex-grow w-full">
                {sections.filter(s => s.page === 'About' && s.isVisible).map(section => {
                    switch (section.type) {
                        case 'AboutHero': return <AboutHeroRenderer key={section.id} data={section as AboutHeroSection} />;
                        case 'OurMission': return <OurMissionRenderer key={section.id} data={section as OurMissionSection} />;
                        case 'TeamNarrative': return <TeamNarrativeRenderer key={section.id} data={section as TeamNarrativeSection} />;
                        case 'MeetTeam': return <MeetTeamRenderer key={section.id} data={section as MeetTeamSection} />;
                        case 'JoinTeam': return <JoinTeamCTARenderer key={section.id} data={section as JoinTeamCTASection} />;
                        case 'ContactCTA': return <ContactCTARenderer key={section.id} data={section as ContactCTASection} />;
                        default: return null;
                    }
                })}
            </main>

            {/* Reusing Footer from Home (Inline for now, should componentize) */}
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
