import type { CMSPageSection } from '@/types/cms';

interface ServiceDetailOverviewPreviewProps {
    section: CMSPageSection;
}

export const ServiceDetailOverviewPreview = ({ section }: ServiceDetailOverviewPreviewProps) => {
    const content = section.content as { overview_image?: { url?: string; alt?: string } };
    const image = content?.overview_image;

    if (!image?.url) {
        return (
            <section className="w-full px-6 md:px-12 lg:px-24 pb-20 bg-white">
                <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden shadow-sm h-48 bg-slate-100 flex items-center justify-center text-slate-400">
                    No image configured
                </div>
            </section>
        );
    }

    return (
        <section className="w-full px-6 md:px-12 lg:px-24 pb-20 bg-white">
            <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden shadow-sm h-[400px] md:h-[600px]">
                <img
                    src={image.url}
                    alt={image.alt ?? 'Overview'}
                    className="w-full h-full object-cover"
                />
            </div>
        </section>
    );
};
