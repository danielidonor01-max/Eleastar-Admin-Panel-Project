import type { CMSPageSection } from '@/types/cms';

interface ServiceDetailHeroPreviewProps {
    section: CMSPageSection;
}

export const ServiceDetailHeroPreview = ({ section }: ServiceDetailHeroPreviewProps) => {
    const content = section.content as { page_title?: string; intro_text?: string };
    const pageTitle = content?.page_title ?? 'Page Title';
    const introText = content?.intro_text ?? '';

    return (
        <section className="bg-white py-24 md:py-32 px-6 md:px-12 lg:px-24">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-extrabold text-[#0B1C3E] mb-6">
                    {pageTitle}
                </h1>
                <div className="w-12 h-1 bg-[#0B1C3E] mb-8 rounded-full" />
                {introText && (
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
                        {introText}
                    </p>
                )}
            </div>
        </section>
    );
};
