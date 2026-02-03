
import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { PageContainer } from '../../components/PageContainer';
import {
    Eye, Save, Layout, Plus, Trash2, ChevronRight
} from 'lucide-react';
import { RichTextEditor } from '../../components/cms/RichTextEditor';
import { ImageUploader } from '../../components/cms/ImageUploader';
import { useSearchParams } from 'react-router-dom';
import { PUBLIC_LINK } from '../../config';
import type {
    CMSSection,
    HeroSection,
    AboutSection, ServicesSection, TeamMember, ServicesHeroSection, ServiceBlockSection, ContactCTASection,
    AboutHeroSection, OurMissionSection, MeetTeamSection,
    ServiceDetailHeroSection, ServiceDetailOverviewSection, ServiceDetailOfferingSection, ServiceDetailContactSection,
    FooterSection, FooterContent
} from '../../data/mockData';

// --- Specific Editor Components ---

const HeroEditor: React.FC<{ section: HeroSection; onChange: (u: Partial<HeroSection>) => void }> = ({ section, onChange }) => (
    <div className="space-y-6">
        {section.cards.map((card, idx) => (
            <div key={card.id || idx} className="p-4 border border-slate-200 rounded-lg bg-slate-50 relative">
                <div className="absolute top-2 right-2 flex gap-2">
                    <button
                        onClick={() => {
                            const newCards = section.cards.filter((_, i) => i !== idx);
                            onChange({ cards: newCards });
                        }}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        title="Remove Card"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
                <h4 className="text-sm font-bold text-slate-500 mb-3 uppercase">Slide {idx + 1}</h4>
                <div className="grid gap-4">
                    <RichTextEditor
                        label="Headline"
                        value={card.headline}
                        onChange={val => {
                            const newCards = [...section.cards];
                            newCards[idx] = { ...newCards[idx], headline: val };
                            onChange({ cards: newCards });
                        }}
                        minHeight="60px"
                        charLimit={60}
                        seoRecommend="Aim for 50-60 chars for best impact."
                    />
                    <RichTextEditor
                        label="Subheadline"
                        value={card.subheadline}
                        onChange={val => {
                            const newCards = [...section.cards];
                            newCards[idx] = { ...newCards[idx], subheadline: val };
                            onChange({ cards: newCards });
                        }}
                        minHeight="80px"
                        charLimit={120}
                        seoRecommend="Keep under 120 chars."
                    />
                    <ImageUploader
                        label="Slide Background"
                        imageUrl={card.imageUrl}
                        altText={card.altText}
                        onImageChange={val => {
                            const newCards = [...section.cards];
                            newCards[idx] = { ...newCards[idx], imageUrl: val };
                            onChange({ cards: newCards });
                        }}
                        onAltTextChange={val => {
                            const newCards = [...section.cards];
                            newCards[idx] = { ...newCards[idx], altText: val };
                            onChange({ cards: newCards });
                        }}
                        recommendedSize="1920 x 1080px"
                        maxSizeInMB={2}
                    />
                </div>
            </div>
        ))}
        {section.cards.length < 5 && (
            <button
                onClick={() => {
                    const newCard = {
                        id: `card-${Date.now()}`,
                        headline: 'New Slide Title',
                        subheadline: 'New slide description goes here.',
                        ctaLabel: 'Learn More',
                        ctaLink: '/',
                        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5'
                    };
                    onChange({ cards: [...section.cards, newCard] });
                }}
                className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-brand-500 hover:text-brand-600 font-medium flex items-center justify-center gap-2"
            >
                <Plus size={16} /> Add Hero Slide
            </button>
        )}
    </div>
);

const AboutEditor: React.FC<{ section: AboutSection; onChange: (u: Partial<AboutSection>) => void }> = ({ section, onChange }) => (
    <div className="space-y-6">
        <RichTextEditor
            label="Title"
            value={section.title}
            onChange={val => onChange({ title: val })}
            minHeight="60px"
            charLimit={60}
            seoRecommend="Clear, concise titles perform better."
        />
        <RichTextEditor
            label="Text"
            value={section.text}
            onChange={val => onChange({ text: val })}
            minHeight="150px"
            charLimit={400}
        />
        <ImageUploader
            label="Section Image"
            imageUrl={section.imageUrl}
            altText={section.altText}
            onImageChange={val => onChange({ imageUrl: val })}
            onAltTextChange={val => onChange({ altText: val })}
            recommendedSize="800 x 600px"
            maxSizeInMB={1}
        />
    </div>
);

const ServicesEditor: React.FC<{ section: ServicesSection; onChange: (u: Partial<ServicesSection>) => void }> = ({ section, onChange }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
            <RichTextEditor label="Title" value={section.title} onChange={val => onChange({ title: val })} minHeight="60px" />
            <RichTextEditor label="Subtitle" value={section.subtitle} onChange={val => onChange({ subtitle: val })} minHeight="60px" />
        </div>

        <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-700">Service List</label>
            {section.services.map((svc, idx) => (
                <div key={svc.id} className="p-4 bg-slate-50 border rounded-lg hover:border-slate-300">
                    <div className="space-y-3">
                        <div className="border-b border-slate-200 pb-2">
                            <input
                                className="w-full bg-transparent font-bold outline-none placeholder-slate-400"
                                placeholder="Service Title (Plain Text for ID usage)"
                                value={svc.title}
                                onChange={e => {
                                    const newSvcs = [...section.services];
                                    newSvcs[idx] = { ...newSvcs[idx], title: e.target.value };
                                    onChange({ services: newSvcs });
                                }}
                            />
                        </div>
                        <RichTextEditor
                            placeholder="Description"
                            value={svc.description}
                            onChange={val => {
                                const newSvcs = [...section.services];
                                newSvcs[idx] = { ...newSvcs[idx], description: val };
                                onChange({ services: newSvcs });
                            }}
                            minHeight="80px"
                        />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// --- About Page Specific Editors ---

const AboutHeroEditor: React.FC<{ section: AboutHeroSection; onChange: (u: Partial<AboutHeroSection>) => void }> = ({ section, onChange }) => (
    <div className="space-y-6">
        <RichTextEditor label="Title" value={section.title} onChange={val => onChange({ title: val })} minHeight="60px" charLimit={60} seoRecommend="Max 60 chars." />
        <RichTextEditor label="Subtitle" value={section.subtitle} onChange={val => onChange({ subtitle: val })} minHeight="60px" charLimit={120} />
        <RichTextEditor label="Description" value={section.description} onChange={val => onChange({ description: val })} minHeight="120px" charLimit={300} />
        <ImageUploader label="Hero Banner" imageUrl={section.imageUrl} altText={section.altText} onImageChange={val => onChange({ imageUrl: val })} onAltTextChange={val => onChange({ altText: val })} recommendedSize="1920 x 600px" maxSizeInMB={2} />
    </div>
);

const OurMissionEditor: React.FC<{ section: OurMissionSection; onChange: (u: Partial<OurMissionSection>) => void }> = ({ section, onChange }) => (
    <div className="space-y-6">
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-700 mb-3">Our Mission</h4>
            <div className="space-y-3">
                <input aria-label="Mission Title" className="w-full px-3 py-2 border rounded-md" placeholder="Mission Title" value={section.missionTitle} onChange={e => onChange({ missionTitle: e.target.value })} />
                <textarea aria-label="Mission Text" className="w-full px-3 py-2 border rounded-md h-20" placeholder="Mission Text" value={section.missionText} onChange={e => onChange({ missionText: e.target.value })} />
            </div>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-700 mb-3">Our Vision</h4>
            <div className="space-y-3">
                <input aria-label="Vision Title" className="w-full px-3 py-2 border rounded-md" placeholder="Vision Title" value={section.visionTitle} onChange={e => onChange({ visionTitle: e.target.value })} />
                <textarea aria-label="Vision Text" className="w-full px-3 py-2 border rounded-md h-20" placeholder="Vision Text" value={section.visionText} onChange={e => onChange({ visionText: e.target.value })} />
            </div>
        </div>
        <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
            <input aria-label="Image URL" className="w-full px-3 py-2 border rounded-md text-sm text-slate-600" value={section.imageUrl} onChange={e => onChange({ imageUrl: e.target.value })} />
        </div>
    </div>
);

const MeetTeamEditor: React.FC<{ section: MeetTeamSection; onChange: (u: Partial<MeetTeamSection>) => void }> = ({ section, onChange }) => (
    <div className="space-y-6">
        <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Section Title</label>
            <input aria-label="Section Title" className="w-full px-3 py-2 border rounded-md" value={section.title} onChange={e => onChange({ title: e.target.value })} />
        </div>
        <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle</label>
            <input aria-label="Subtitle" className="w-full px-3 py-2 border rounded-md" value={section.subtitle} onChange={e => onChange({ subtitle: e.target.value })} />
        </div>

        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-700">Team Members</label>
                <button
                    className="text-xs text-brand-600 font-bold hover:underline"
                    onClick={() => {
                        const newMember: TeamMember = { id: `tm-${Date.now()}`, name: 'New Member', role: 'Role', imageUrl: 'https://ui-avatars.com/api/?name=New+Member' };
                        onChange({ members: [...section.members, newMember] });
                    }}
                >
                    + Add Member
                </button>
            </div>
            {section.members.map((member, idx) => (
                <div key={member.id} className="p-4 border rounded-md bg-slate-50 relative">
                    <button
                        onClick={() => {
                            const newMembers = section.members.filter((_, i) => i !== idx);
                            onChange({ members: newMembers });
                        }}
                        className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600"
                        title="Remove Member"
                    >
                        <Trash2 size={14} />
                    </button>
                    <div className="grid grid-cols-2 gap-3 mb-3 pr-6">
                        <input aria-label="Member Name" className="w-full px-2 py-1 border rounded text-sm placeholder:text-slate-400" placeholder="Name" value={member.name} onChange={e => {
                            const newMembers = [...section.members];
                            newMembers[idx] = { ...newMembers[idx], name: e.target.value };
                            onChange({ members: newMembers });
                        }} />
                        <input aria-label="Member Role" className="w-full px-2 py-1 border rounded text-sm placeholder:text-slate-400" placeholder="Role" value={member.role} onChange={e => {
                            const newMembers = [...section.members];
                            newMembers[idx] = { ...newMembers[idx], role: e.target.value };
                            onChange({ members: newMembers });
                        }} />
                    </div>
                    <div className="mb-3">
                        <ImageUploader
                            label="Member Photo"
                            imageUrl={member.imageUrl}
                            onImageChange={val => {
                                const newMembers = [...section.members];
                                newMembers[idx] = { ...newMembers[idx], imageUrl: val };
                                onChange({ members: newMembers });
                            }}
                            recommendedSize="400 x 400px (Square)"
                        />
                    </div>
                    <RichTextEditor
                        placeholder="Short Bio"
                        value={member.bio || ''}
                        onChange={val => {
                            const newMembers = [...section.members];
                            newMembers[idx] = { ...newMembers[idx], bio: val };
                            onChange({ members: newMembers });
                        }}
                        minHeight="100px"
                    />
                </div>
            ))}
        </div>
    </div>
);

// --- Services Page Specific Editors ---

const ServicesHeroEditor: React.FC<{ section: ServicesHeroSection; onChange: (u: Partial<ServicesHeroSection>) => void }> = ({ section, onChange }) => (
    <div className="space-y-6">
        <RichTextEditor label="Title (Small)" value={section.title} onChange={val => onChange({ title: val })} minHeight="60px" charLimit={40} />
        <RichTextEditor label="Headline (Large)" value={section.headline} onChange={val => onChange({ headline: val })} minHeight="80px" charLimit={80} seoRecommend="Powerful, short headline." />
        <RichTextEditor label="Description" value={section.description} onChange={val => onChange({ description: val })} minHeight="120px" charLimit={250} />
        <ImageUploader label="Hero Banner" imageUrl={section.imageUrl} altText={section.altText} onImageChange={val => onChange({ imageUrl: val })} onAltTextChange={val => onChange({ altText: val })} recommendedSize="1920 x 600px" maxSizeInMB={2} />
    </div>
);

const ServiceBlockEditor: React.FC<{ section: ServiceBlockSection; onChange: (u: Partial<ServiceBlockSection>) => void }> = ({ section, onChange }) => (
    <div className="space-y-4">
        <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Service Title</label>
            <input aria-label="Service Title" className="w-full px-3 py-2 border rounded-md" value={section.serviceTitle} onChange={e => onChange({ serviceTitle: e.target.value })} />
        </div>
        <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea aria-label="Description" className="w-full px-3 py-2 border rounded-md h-32" value={section.description} onChange={e => onChange({ description: e.target.value })} />
            <p className="text-xs text-slate-400 mt-1">Supports basic HTML or newlines.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CTA Label</label>
                <input className="w-full px-3 py-2 border rounded-md" value={section.ctaLabel} onChange={e => onChange({ ctaLabel: e.target.value })} />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CTA Link</label>
                <input className="w-full px-3 py-2 border rounded-md" value={section.ctaLink} onChange={e => onChange({ ctaLink: e.target.value })} />
            </div>
        </div>
        <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
            <input className="w-full px-3 py-2 border rounded-md text-sm text-slate-600" value={section.imageUrl} onChange={e => onChange({ imageUrl: e.target.value })} />
        </div>
    </div>
);

const ContactCTAEditor: React.FC<{ section: ContactCTASection; onChange: (u: Partial<ContactCTASection>) => void }> = ({ section, onChange }) => (
    <div className="space-y-6">
        <RichTextEditor label="Title" value={section.title} onChange={val => onChange({ title: val })} minHeight="60px" charLimit={60} />
        <RichTextEditor label="Text" value={section.text} onChange={val => onChange({ text: val })} minHeight="100px" charLimit={200} />
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CTA Label</label>
                <input aria-label="CTA Label" className="w-full px-3 py-2 border rounded-md" value={section.ctaLabel} onChange={e => onChange({ ctaLabel: e.target.value })} />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CTA Link</label>
                <input aria-label="CTA Link" className="w-full px-3 py-2 border rounded-md" value={section.ctaLink} onChange={e => onChange({ ctaLink: e.target.value })} />
            </div>
        </div>
    </div>
);

const ServiceDetailHeroEditor: React.FC<{ section: ServiceDetailHeroSection; onChange: (u: Partial<ServiceDetailHeroSection>) => void }> = ({ section, onChange }) => (
    <div className="space-y-6">
        <RichTextEditor
            label="Page Title"
            value={section.title}
            onChange={val => onChange({ title: val })}
            minHeight="60px"
            charLimit={60}
            seoRecommend="Primary keyword in title."
        />
        <RichTextEditor
            label="Intro Text"
            value={section.intro}
            onChange={val => onChange({ intro: val })}
            minHeight="120px"
            charLimit={300}
        />
    </div>
);

const ServiceDetailOverviewEditor: React.FC<{ section: ServiceDetailOverviewSection; onChange: (u: Partial<ServiceDetailOverviewSection>) => void }> = ({ section, onChange }) => (
    <div className="space-y-6">
        <ImageUploader
            label="Overview Image"
            imageUrl={section.imageUrl}
            altText={section.altText}
            onImageChange={val => onChange({ imageUrl: val })}
            onAltTextChange={val => onChange({ altText: val })}
            recommendedSize="1920 x 800px"
            maxSizeInMB={2}
        />
    </div>
);

const ServiceDetailOfferingEditor: React.FC<{ section: ServiceDetailOfferingSection; onChange: (u: Partial<ServiceDetailOfferingSection>) => void }> = ({ section, onChange }) => (
    <div className="space-y-6">
        <div className="flex gap-4">
            <div className="w-1/4">
                <label className="block text-xs font-bold text-slate-700 mb-1">Number</label>
                <input aria-label="Number" className="w-full px-3 py-2 border rounded-md" value={section.number} onChange={e => onChange({ number: e.target.value })} />
            </div>
            <div className="w-3/4">
                <RichTextEditor label="Title" value={section.title} onChange={val => onChange({ title: val })} minHeight="60px" />
            </div>
        </div>
        <RichTextEditor label="Description" value={section.description} onChange={val => onChange({ description: val })} minHeight="120px" />
        <ImageUploader label="Section Image" imageUrl={section.imageUrl} altText={section.altText} onImageChange={val => onChange({ imageUrl: val })} onAltTextChange={val => onChange({ altText: val })} recommendedSize="800 x 600px" maxSizeInMB={1} />
    </div>
);

const ServiceDetailContactEditor: React.FC<{ section: ServiceDetailContactSection; onChange: (u: Partial<ServiceDetailContactSection>) => void }> = ({ section, onChange }) => (
    <div className="space-y-6">
        <RichTextEditor label="Title" value={section.title} onChange={val => onChange({ title: val })} minHeight="60px" />
        <RichTextEditor label="Description" value={section.description} onChange={val => onChange({ description: val })} minHeight="100px" />
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CTA Label</label>
                <input aria-label="CTA Label" className="w-full px-3 py-2 border rounded-md" value={section.ctaLabel} onChange={e => onChange({ ctaLabel: e.target.value })} />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CTA Link</label>
                <input aria-label="CTA Link" className="w-full px-3 py-2 border rounded-md" value={section.ctaLink} onChange={e => onChange({ ctaLink: e.target.value })} />
            </div>
        </div>
    </div>
);

const CommonEditor: React.FC<{ section: CMSSection; onChange: (u: Partial<CMSSection>) => void }> = ({ section, onChange }) => (
    <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-200">
        <p className="font-bold mb-2">Detailed Editor Pending</p>
        <p className="mb-4">This section type ({section.type}) does not have a specialized editor yet. You can edit the raw JSON below if needed.</p>
        <div className="grid gap-2">
            {Object.keys(section).map(key => {
                if (['id', 'type', 'status', 'lastUpdated', 'isVisible', 'order', 'page'].includes(key)) return null;
                const val = (section as unknown as Record<string, unknown>)[key];
                if (typeof val === 'string') {
                    return (
                        <div key={key}>
                            <label className="block text-xs font-bold text-slate-700 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                            <input
                                aria-label={key}
                                className="w-full px-3 py-2 border rounded-md"
                                value={val}
                                onChange={e => onChange({ [key]: e.target.value } as Partial<CMSSection>)}
                            />
                        </div>
                    );
                }
                return null;
            })}
        </div>
    </div>
);

// --- Footer Editors ---

const FooterNavEditor: React.FC<{ section: FooterSection; onChange: (u: Partial<FooterSection>) => void }> = ({ section, onChange }) => (
    <div className="space-y-4">
        <p className="text-sm text-slate-500 mb-4">Edit the labels and URLs of primary navigation links. You cannot add or remove these core links.</p>
        {section.links?.map((link, idx) => (
            <div key={link.id} className="grid grid-cols-2 gap-4 p-3 border rounded-md bg-slate-50">
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Label</label>
                    <input
                        aria-label="Link Label"
                        className="w-full px-2 py-1 border rounded text-sm"
                        value={link.label}
                        onChange={e => {
                            const newLinks = [...(section.links || [])];
                            newLinks[idx] = { ...newLinks[idx], label: e.target.value };
                            onChange({ links: newLinks });
                        }}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">URL</label>
                    <input
                        aria-label="Link URL"
                        className="w-full px-2 py-1 border rounded text-sm"
                        value={link.url}
                        onChange={e => {
                            const newLinks = [...(section.links || [])];
                            newLinks[idx] = { ...newLinks[idx], url: e.target.value };
                            onChange({ links: newLinks });
                        }}
                    />
                </div>
            </div>
        ))}
    </div>
);

const FooterUtilityEditor: React.FC<{ section: FooterSection; onChange: (u: Partial<FooterSection>) => void }> = ({ section, onChange }) => (
    <div className="space-y-4">
        {section.links?.map((link, idx) => (
            <div key={link.id} className="p-3 border rounded-md bg-slate-50 flex items-center justify-between gap-4">
                <div className="flex-grow grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Label</label>
                        <input
                            aria-label="Utility Link Label"
                            className="w-full px-2 py-1 border rounded text-sm"
                            value={link.label}
                            onChange={e => {
                                const newLinks = [...(section.links || [])];
                                newLinks[idx] = { ...newLinks[idx], label: e.target.value };
                                onChange({ links: newLinks });
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">URL</label>
                        <input
                            aria-label="Utility Link URL"
                            className="w-full px-2 py-1 border rounded text-sm"
                            value={link.url}
                            onChange={e => {
                                const newLinks = [...(section.links || [])];
                                newLinks[idx] = { ...newLinks[idx], url: e.target.value };
                                onChange({ links: newLinks });
                            }}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Visible</label>
                    <input
                        aria-label="Utility Link Visibility"
                        type="checkbox"
                        checked={link.isVisible}
                        onChange={e => {
                            const newLinks = [...(section.links || [])];
                            newLinks[idx] = { ...newLinks[idx], isVisible: e.target.checked };
                            onChange({ links: newLinks });
                        }}
                        className="w-4 h-4"
                    />
                </div>
            </div>
        ))}
    </div>
);

const FooterSocialEditor: React.FC<{ section: FooterSection; onChange: (u: Partial<FooterSection>) => void }> = ({ section, onChange }) => (
    <div className="space-y-4">
        {section.links?.map((link, idx) => (
            <div key={link.id} className="p-3 border rounded-md bg-slate-50 flex items-center justify-between gap-4">
                <div className="flex-grow">
                    <label className="block text-xs font-bold text-slate-700 mb-1">{link.label} URL</label>
                    <input
                        aria-label={`${link.label} URL`}
                        className="w-full px-2 py-1 border rounded text-sm"
                        value={link.url}
                        onChange={e => {
                            const newLinks = [...(section.links || [])];
                            newLinks[idx] = { ...newLinks[idx], url: e.target.value };
                            onChange({ links: newLinks });
                        }}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Visible</label>
                    <input
                        aria-label={`${link.label} Visibility`}
                        type="checkbox"
                        checked={link.isVisible}
                        onChange={e => {
                            const newLinks = [...(section.links || [])];
                            newLinks[idx] = { ...newLinks[idx], isVisible: e.target.checked };
                            onChange({ links: newLinks });
                        }}
                        className="w-4 h-4"
                    />
                </div>
            </div>
        ))}
    </div>
);

const FooterLegalEditor: React.FC<{ section: FooterSection; onChange: (u: Partial<FooterSection>) => void }> = ({ section, onChange }) => (
    <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-800 mb-2">
            <strong>Warning:</strong> Changes to legal text significantly impact compliance. Please review carefully before publishing.
        </div>
        <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Legal Disclaimer Text</label>
            <textarea
                aria-label="Legal Disclaimer Text"
                className="w-full px-3 py-2 border rounded-md h-48"
                value={section.content}
                onChange={e => onChange({ content: e.target.value })}
            />
        </div>
    </div>
);

const FooterCopyrightEditor: React.FC<{ section: FooterSection; onChange: (u: Partial<FooterSection>) => void }> = ({ section, onChange }) => (
    <div className="space-y-4">
        <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company Registration Number (RC)</label>
            <input
                aria-label="Registration Number"
                className="w-full px-3 py-2 border rounded-md"
                value={section.content}
                onChange={e => onChange({ content: e.target.value })}
            />
        </div>
    </div>
);

// --- Main CMS Page ---

export const CMSPage: React.FC = () => {
    const { cmsContent, updatePMSContent, publishPMSContent, addCMSContent, deleteCMSContent, footerContent, updateFooterContent } = useAdmin();
    const [searchParams] = useSearchParams();

    // Derived Active Page from URL, default to Home
    const rawPage = searchParams.get('page');
    // Sanitize to valid type
    const activePage: 'Home' | 'About' | 'Services' | 'IndustrialSolutions' | 'InformationTechnology' | 'ResearchAndDevelopment' | 'ElectronicsManufacturing' | 'SpecificITServices' | 'Careers' | 'Contact' | 'Footer' =
        (rawPage as any) || 'Home';

    // Filter sections by active page
    // Note: Careers page content handling might need specific check if it's not standard CMSSection
    const pageSections = cmsContent.filter(s => s.page === activePage);

    // Manage selection state per page or globally? Globally is fine, just reset on page switch if needed.
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Auto-select first item if selection is invalid for current page
    React.useEffect(() => {
        if (activePage === 'Footer') {
            if (!selectedId) setSelectedId('footer-nav');
        } else if (!selectedId || !pageSections.find(s => s.id === selectedId)) {
            if (pageSections.length > 0) {
                setSelectedId(pageSections[0].id);
            } else {
                setSelectedId(null);
            }
        }
    }, [activePage, pageSections, selectedId]);

    const activeSection = cmsContent.find(c => c.id === selectedId);

    const PREVIEW_URL = PUBLIC_LINK || window.location.origin;
    const currentPagePreviewLink = activePage === 'About'
        ? `${PREVIEW_URL}/about`
        : activePage === 'Services'
            ? `${PREVIEW_URL}/services`
            : activePage === 'IndustrialSolutions'
                ? `${PREVIEW_URL}/services/industrial-solutions`
                : activePage === 'InformationTechnology'
                    ? `${PREVIEW_URL}/services/information-technology`
                    : activePage === 'ResearchAndDevelopment'
                        ? `${PREVIEW_URL}/services/research-and-development`
                        : activePage === 'ElectronicsManufacturing'
                            ? `${PREVIEW_URL}/services/electronics-manufacturing`
                            : activePage === 'SpecificITServices'
                                ? `${PREVIEW_URL}/services/specific-it-services`
                                : activePage === 'Careers'
                                    ? `${PREVIEW_URL}/careers`
                                    : activePage === 'Contact'
                                        ? `${PREVIEW_URL}/contact`
                                        : PREVIEW_URL;

    const handleUpdate = (updates: Partial<CMSSection>) => {
        if (selectedId) {
            updatePMSContent(selectedId, updates);
        }
    };

    const handleFooterUpdate = (updates: Partial<FooterSection>) => {
        if (activePage === 'Footer' && selectedId) {
            // Map selectedId to keys
            const keyMap: Record<string, keyof FooterContent> = {
                'footer-nav': 'navigation',
                'footer-utility': 'utility',
                'footer-social': 'social',
                'footer-legal': 'legal',
                'footer-copyright': 'copyright'
            };
            const sectionKey = keyMap[selectedId];
            if (sectionKey) {
                updateFooterContent(sectionKey, updates);
            }
        }
    };

    const renderEditor = () => {
        if (activePage === 'Footer') {
            switch (selectedId) {
                case 'footer-nav': return <FooterNavEditor section={footerContent.navigation} onChange={handleFooterUpdate} />;
                case 'footer-utility': return <FooterUtilityEditor section={footerContent.utility} onChange={handleFooterUpdate} />;
                case 'footer-social': return <FooterSocialEditor section={footerContent.social} onChange={handleFooterUpdate} />;
                case 'footer-legal': return <FooterLegalEditor section={footerContent.legal} onChange={handleFooterUpdate} />;
                case 'footer-copyright': return <FooterCopyrightEditor section={footerContent.copyright} onChange={handleFooterUpdate} />;
                default: return <div>Select a footer section</div>;
            }
        }

        if (!activeSection) return null;
        switch (activeSection.type) {
            // Home Sections
            case 'Hero': return <HeroEditor section={activeSection as HeroSection} onChange={handleUpdate} />;
            case 'About': return <AboutEditor section={activeSection as AboutSection} onChange={handleUpdate} />; // Shared name, but careful with type assertion if structure differs. MockData has distinct types but AboutSection interface matches Home's About.
            case 'Services': return <ServicesEditor section={activeSection as ServicesSection} onChange={handleUpdate} />;

            // About Page Sections
            case 'AboutHero': return <AboutHeroEditor section={activeSection as AboutHeroSection} onChange={handleUpdate} />;
            case 'OurMission': return <OurMissionEditor section={activeSection as OurMissionSection} onChange={handleUpdate} />;
            case 'MeetTeam': return <MeetTeamEditor section={activeSection as MeetTeamSection} onChange={handleUpdate} />;

            // Services Page Sections
            case 'ServicesHero': return <ServicesHeroEditor section={activeSection as ServicesHeroSection} onChange={handleUpdate} />;
            case 'ServiceBlock': return <ServiceBlockEditor section={activeSection as ServiceBlockSection} onChange={handleUpdate} />;
            case 'ContactCTA': return <ContactCTAEditor section={activeSection as ContactCTASection} onChange={handleUpdate} />;

            // Industrial Solutions Sections
            case 'ServiceDetailHero': return <ServiceDetailHeroEditor section={activeSection as ServiceDetailHeroSection} onChange={handleUpdate} />;
            case 'ServiceDetailOverview': return <ServiceDetailOverviewEditor section={activeSection as ServiceDetailOverviewSection} onChange={handleUpdate} />;
            case 'ServiceDetailOffering': return <ServiceDetailOfferingEditor section={activeSection as ServiceDetailOfferingSection} onChange={handleUpdate} />;
            case 'ServiceDetailContact': return <ServiceDetailContactEditor section={activeSection as ServiceDetailContactSection} onChange={handleUpdate} />;

            // Generic fallback for others (TeamNarrative, JoinTeam, etc.)
            default: return <CommonEditor section={activeSection} onChange={handleUpdate} />;
        }
    };

    // Breadcrumb Helper
    const getBreadcrumbs = () => {
        const base = <span className="text-slate-500">Website CMS</span>;
        const separator = <ChevronRight size={14} className="text-slate-400" />;

        let parent = null;
        let current = activePage.replace(/([A-Z])/g, ' $1').trim();

        if (['IndustrialSolutions', 'InformationTechnology', 'ResearchAndDevelopment', 'ElectronicsManufacturing', 'SpecificITServices'].includes(activePage)) {
            parent = 'Services';
        } else if (['Careers'].includes(activePage)) {
            parent = 'Eleastar & You';
        }

        // Clean up title display
        if (current === 'Services') current = 'Services Main';
        if (current === 'Industrial Solutions') current = 'Industrial Solutions';
        // ... mappings can be refined

        return (
            <div className="flex items-center gap-2 text-xs font-bold mb-4">
                {base}
                {separator}
                {parent && (
                    <>
                        <span className="text-slate-500">{parent}</span>
                        {separator}
                    </>
                )}
                <span className="text-brand-600">{current}</span>
            </div>
        );
    };

    return (
        <PageContainer title="Website CMS Manager">
            <div className="flex flex-col h-[calc(100vh-140px)]">
                {/* Breadcrumb & Context Header */}
                <div className="mb-6 pb-4 border-b border-slate-200">
                    {getBreadcrumbs()}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-slate-800">{activePage.replace(/([A-Z])/g, ' $1').trim()}</h2>
                            <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-xs font-bold uppercase border border-green-200">
                                Live
                            </span>
                        </div>

                        <a
                            href={currentPagePreviewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
                        >
                            <Eye size={16} /> Preview Page
                        </a>
                    </div>
                    <div>
                        {activeSection?.status === 'Draft' && (
                            <button
                                onClick={() => {
                                    if (selectedId && confirm('Are you sure you want to publish these changes? This will make them visible on the live site.')) {
                                        publishPMSContent(selectedId);
                                    }
                                }}
                                className="flex items-center gap-2 px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-sm font-bold animate-pulse"
                            >
                                <Save size={18} /> Publish Changes
                            </button>
                        )}
                    </div>
                </div >

                <div className="flex flex-grow gap-8 overflow-hidden">
                    {/* Section List (Sidebar) */}
                    <div className="w-1/3 overflow-y-auto pr-2 space-y-3">
                        {pageSections.map((section) => (
                            <div
                                key={section.id}
                                onClick={() => setSelectedId(section.id)}
                                className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 group ${selectedId === section.id
                                    ? 'bg-brand-50 border-brand-200 shadow-sm'
                                    : 'bg-white border-slate-200 hover:border-brand-200 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${section.isVisible ? 'bg-green-500' : 'bg-slate-300'}`} />
                                        <h3 className={`font-bold ${selectedId === section.id ? 'text-brand-900' : 'text-slate-700'}`}>
                                            {section.type.replace(/([A-Z])/g, ' $1').trim()}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                updatePMSContent(section.id, { isVisible: !section.isVisible });
                                            }}
                                            className={`p-1 rounded hover:bg-slate-100 ${section.isVisible ? 'text-green-600' : 'text-slate-400'}`}
                                            title={section.isVisible ? "Hide Section" : "Show Section"}
                                        >
                                            <Eye size={14} />
                                        </button>
                                        {section.type === 'ServiceDetailOffering' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm('Are you sure you want to delete this offering?')) {
                                                        deleteCMSContent(section.id);
                                                        if (selectedId === section.id) setSelectedId(null);
                                                    }
                                                }}
                                                className="p-1 rounded hover:bg-red-100 text-slate-400 hover:text-red-600"
                                                title="Delete Offering"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className={`text-xs ${selectedId === section.id ? 'text-brand-600' : 'text-slate-500'}`}>
                                    Status: {section.status}
                                </div>
                            </div>
                        ))}

                        {activePage === 'Footer' && (
                            <>
                                {Object.values(footerContent).filter(s => s.id !== 'footer-brand').map((section) => (
                                    <div
                                        key={section.id}
                                        onClick={() => setSelectedId(section.id)}
                                        className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 ${selectedId === section.id
                                            ? 'bg-brand-50 border-brand-200 shadow-sm'
                                            : 'bg-white border-slate-200 hover:border-brand-200 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className={`font-bold ${selectedId === section.id ? 'text-brand-900' : 'text-slate-700'}`}>
                                                    {section.title || section.id}
                                                </h3>
                                            </div>
                                        </div>
                                        <div className={`text-xs ${selectedId === section.id ? 'text-brand-600' : 'text-slate-500'}`}>
                                            Last Updated: {new Date(section.lastUpdated).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        {activePage === 'IndustrialSolutions' && (
                            <button
                                onClick={() => {
                                    const newContent: ServiceDetailOfferingSection = {
                                        id: `ind-offering-${Date.now()}`,
                                        type: 'ServiceDetailOffering',
                                        page: 'IndustrialSolutions',
                                        isVisible: true,
                                        order: pageSections.length + 1,
                                        status: 'Draft',
                                        lastUpdated: new Date().toISOString(),
                                        number: '00',
                                        title: 'New Offering',
                                        description: 'New Description',
                                        imageUrl: 'https://images.unsplash.com/photo-1581093450065-0a6b42b12975?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                                    };
                                    addCMSContent(newContent);
                                }}
                                className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-brand-500 hover:text-brand-600 font-medium flex items-center justify-center gap-2"
                            >
                                <Plus size={16} /> Add Offering
                            </button>
                        )}

                        {activePage === 'InformationTechnology' && (
                            <button
                                onClick={() => {
                                    const newContent: ServiceDetailOfferingSection = {
                                        id: `it-offering-${Date.now()}`,
                                        type: 'ServiceDetailOffering',
                                        page: 'InformationTechnology',
                                        isVisible: true,
                                        order: pageSections.length + 1,
                                        status: 'Draft',
                                        lastUpdated: new Date().toISOString(),
                                        number: '00',
                                        title: 'New Offering',
                                        description: 'New Description',
                                        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                                    };
                                    addCMSContent(newContent);
                                }}
                                className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-brand-500 hover:text-brand-600 font-medium flex items-center justify-center gap-2"
                            >
                                <Plus size={16} /> Add Offering
                            </button>
                        )}

                        {activePage === 'ResearchAndDevelopment' && (
                            <button
                                onClick={() => {
                                    const newContent: ServiceDetailOfferingSection = {
                                        id: `rnd-offering-${Date.now()}`,
                                        type: 'ServiceDetailOffering',
                                        page: 'ResearchAndDevelopment',
                                        isVisible: true,
                                        order: pageSections.length + 1,
                                        status: 'Draft',
                                        lastUpdated: new Date().toISOString(),
                                        number: '00',
                                        title: 'New R&D Offering',
                                        description: 'New Description',
                                        imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                                    };
                                    addCMSContent(newContent);
                                }}
                                className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-brand-500 hover:text-brand-600 font-medium flex items-center justify-center gap-2"
                            >
                                <Plus size={16} /> Add Offering
                            </button>
                        )}

                        {activePage === 'ElectronicsManufacturing' && (
                            <button
                                onClick={() => {
                                    const newContent: ServiceDetailOfferingSection = {
                                        id: `elec-offering-${Date.now()}`,
                                        type: 'ServiceDetailOffering',
                                        page: 'ElectronicsManufacturing',
                                        isVisible: true,
                                        order: pageSections.length + 1,
                                        status: 'Draft',
                                        lastUpdated: new Date().toISOString(),
                                        number: '00',
                                        title: 'New Electronics Offering',
                                        description: 'New Description',
                                        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                                    };
                                    addCMSContent(newContent);
                                }}
                                className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-brand-500 hover:text-brand-600 font-medium flex items-center justify-center gap-2"
                            >
                                <Plus size={16} /> Add Offering
                            </button>
                        )}

                        {activePage === 'SpecificITServices' && (
                            <button
                                onClick={() => {
                                    const newContent: ServiceDetailOfferingSection = {
                                        id: `spec-offering-${Date.now()}`,
                                        type: 'ServiceDetailOffering',
                                        page: 'SpecificITServices',
                                        isVisible: true,
                                        order: pageSections.length + 1,
                                        status: 'Draft',
                                        lastUpdated: new Date().toISOString(),
                                        number: '00',
                                        title: 'New Service Offering',
                                        description: 'New Description',
                                        imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                                    };
                                    addCMSContent(newContent);
                                }}
                                className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-brand-500 hover:text-brand-600 font-medium flex items-center justify-center gap-2"
                            >
                                <Plus size={16} /> Add Offering
                            </button>
                        )}
                    </div>

                    {/* Editor Area */}
                    <div className="w-2/3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                <Layout size={18} className="text-brand-500" />
                                Edit {activeSection?.type}
                            </h2>
                            <div className="text-xs text-slate-400">
                                ID: {activeSection?.id}
                            </div>
                        </div>
                        <div className="p-6 overflow-y-auto flex-grow">
                            {renderEditor()}
                        </div>
                    </div>
                </div>
            </div >
        </PageContainer >
    );
};
