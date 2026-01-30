import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export const BrandFooter: React.FC = () => {
    const { footerContent } = useAdmin();

    const { navigation, utility, social, legal, copyright } = footerContent;

    return (
        <footer className="bg-[#020617] text-white pt-16 pb-8 overflow-hidden relative">
            {/* Top Section: Nav & Socials */}
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 relative z-10">
                {/* Section 1: Navigation */}
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                    <nav className="flex flex-wrap gap-x-8 gap-y-4">
                        {navigation.links?.map(link => (
                            <a
                                key={link.id}
                                href={link.url}
                                className="text-sm font-medium hover:text-brand-400 transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                </div>

                {/* Section 3: Socials & Contact Actions (right aligned on large) */}
                <div className="flex flex-col items-start md:items-end gap-6">
                    <div className="flex gap-4">
                        {social.links?.filter(l => l.isVisible).map(link => {
                            const Icon = link.label.includes('Facebook') ? Facebook :
                                link.label.includes('Twitter') || link.label.includes('X') ? Twitter :
                                    link.label.includes('Instagram') ? Instagram : Linkedin;
                            return (
                                <a
                                    key={link.id}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-600 transition-colors"
                                    aria-label={link.label}
                                >
                                    <Icon size={18} />
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Middle Section: Utility & Legal */}
            <div className="max-w-7xl mx-auto px-6 mb-20 relative z-10">
                <div className="flex flex-wrap gap-6 mb-8 text-xs text-slate-400 font-medium uppercase tracking-wider">
                    {utility.links?.filter(l => l.isVisible).map(link => (
                        <a key={link.id} href={link.url} className="hover:text-white transition-colors">
                            {link.label}
                        </a>
                    ))}
                    <div className="flex-grow text-right">
                        <span>Copyright © {new Date().getFullYear()}</span>
                        <span className="mx-2">•</span>
                        <span>{copyright.content}</span>
                    </div>
                </div>

                {/* Section 4: Legal Text */}
                <div className="max-w-4xl">
                    <p className="text-[10px] leading-relaxed text-slate-500 text-justify">
                        {legal.content}
                    </p>
                </div>
            </div>

            {/* Section 6: Brand Background Element */}
            <div className="w-full flex justify-center items-end absolute bottom-[-5%] left-0 z-0 pointer-events-none opacity-100 mix-blend-overlay">
                <h1 className="text-[18vw] font-bold leading-none tracking-tighter text-brand-600 select-none">
                    Eleastar
                </h1>
            </div>

            {/* Overlay Gradient for readability over the big text if needed, though mix-blend might handle it. 
                Let's add a subtle gradient at the bottom to fade the footer into the page if needed, 
                but usually footer is solid. The user design matches the image which is solid dark blue/black.
            */}
        </footer>
    );
};
