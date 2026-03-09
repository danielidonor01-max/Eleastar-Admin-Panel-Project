import type { CMSPageSection } from '@/types/cms';

interface ServiceDetailOfferingPreviewProps {
    section: CMSPageSection;
}

export const ServiceDetailOfferingPreview = ({ section }: ServiceDetailOfferingPreviewProps) => {
    const content = section.content as {
        number?: string;
        title?: string;
        description?: string;
        image?: { url?: string; alt?: string };
    };
    const number = content?.number ?? '';
    const title = content?.title ?? 'Offering Title';
    const description = content?.description ?? '';
    const image = content?.image;

    return (
        <section className="bg-[#0B0F19] text-white py-24 px-6 md:px-12 lg:px-24 overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col items-center gap-16 lg:gap-24 lg:flex-row">
                <div className="w-full lg:w-1/2 relative z-10">
                    {number && (
                        <div className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 font-bold rounded-full mb-6">
                            {number}
                        </div>
                    )}
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">{title}</h2>
                    {description && (
                        <p className="text-gray-400 text-lg leading-relaxed mb-8">{description}</p>
                    )}
                </div>
                <div className="w-full lg:w-1/2">
                    {image?.url ? (
                        <div className="relative rounded-3xl overflow-hidden h-[400px] md:h-[500px]">
                            <img
                                src={image.url}
                                alt={image.alt ?? title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent opacity-40" />
                        </div>
                    ) : (
                        <div className="relative rounded-3xl overflow-hidden h-[400px] md:h-[500px] bg-slate-800 flex items-center justify-center text-slate-500">
                            No image
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
