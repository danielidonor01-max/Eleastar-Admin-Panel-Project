import { Link } from 'react-router';
import type { CMSPageSection } from '@/types/cms';

interface ServiceDetailContactPreviewProps {
    section: CMSPageSection;
}

export const ServiceDetailContactPreview = ({ section }: ServiceDetailContactPreviewProps) => {
    const content = section.content as {
        title?: string;
        description?: string;
        cta_label?: string;
        cta_link?: string;
    };
    const title = content?.title ?? 'Contact Us';
    const description = content?.description ?? '';
    const ctaLabel = content?.cta_label ?? 'Get in Touch';
    const ctaLink = content?.cta_link ?? '/contact';

    return (
        <section className="bg-white py-24 px-6 md:px-12 lg:px-24">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">{title}</h2>
                {description && (
                    <p className="text-lg text-slate-600 leading-relaxed mb-8">{description}</p>
                )}
                <Link
                    to={ctaLink}
                    className="inline-flex items-center px-8 py-4 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors"
                >
                    {ctaLabel}
                </Link>
            </div>
        </section>
    );
};
