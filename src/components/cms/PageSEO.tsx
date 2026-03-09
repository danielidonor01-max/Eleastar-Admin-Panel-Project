import React, { useEffect } from 'react';
import { useCMSStore } from '@/stores/useCMSStore';

interface PageSEOProps {
    slug: string;
    fallbackTitle?: string;
    fallbackDescription?: string;
}

/**
 * Standardized SEO component to handle meta tags and page title updates.
 * Pulls data from CMS metaData based on slug, with sensible fallbacks.
 */
export const PageSEO: React.FC<PageSEOProps> = ({
    slug,
    fallbackTitle = "Eleastar Technologies Ltd.",
    fallbackDescription = "Leading provider of technology solutions and industrial innovation."
}) => {
    const cmsContent = useCMSStore((s) => s.cmsContent);

    useEffect(() => {
        // Find matching metadata in CMS
        const seo = cmsContent?.metaData?.find(m => m.slug === slug);

        // Document Title
        const finalTitle = seo?.title || fallbackTitle;
        document.title = finalTitle;

        // Meta Description
        const finalDesc = seo?.description || fallbackDescription;
        let metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', finalDesc);
        } else {
            const meta = document.createElement('meta');
            meta.name = 'description';
            meta.content = finalDesc;
            document.head.appendChild(meta);
        }

        // Meta Keywords
        if (seo?.keywords) {
            let metaKeywords = document.querySelector('meta[name="keywords"]');
            if (metaKeywords) {
                metaKeywords.setAttribute('content', seo.keywords);
            } else {
                const meta = document.createElement('meta');
                meta.name = 'keywords';
                meta.content = seo.keywords;
                document.head.appendChild(meta);
            }
        }

        // OG Tags (Optional/Extra)
        if (seo?.ogTags) {
            const updateOg = (property: string, content: string) => {
                let tag = document.querySelector(`meta[property="${property}"]`);
                if (tag) {
                    tag.setAttribute('content', content);
                } else {
                    const meta = document.createElement('meta');
                    meta.setAttribute('property', property);
                    meta.content = content;
                    document.head.appendChild(meta);
                }
            };

            updateOg('og:title', seo.ogTags.ogTitle || finalTitle);
            updateOg('og:description', seo.ogTags.ogDescription || finalDesc);
            if (seo.ogTags.ogImage?.url) {
                updateOg('og:image', seo.ogTags.ogImage.url);
            }
        }
    }, [slug, cmsContent?.metaData, fallbackTitle, fallbackDescription]);

    return null; // Side-effect only component
};
