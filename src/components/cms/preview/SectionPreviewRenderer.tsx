import type { CMSPageSection } from '@/types/cms';
import { GenericSectionPreview } from './GenericSectionPreview';

/** Optional: register custom preview components for specific section types */
const customPreviews: Record<string, React.ComponentType<{ section: CMSPageSection }>> = {};

export function registerSectionPreview(type: string, component: React.ComponentType<{ section: CMSPageSection }>): void {
    customPreviews[type] = component;
}

interface SectionPreviewRendererProps {
    sections: CMSPageSection[];
}

export const SectionPreviewRenderer = ({ sections }: SectionPreviewRendererProps) => {
    const sorted = [...sections].sort((a, b) => a.order - b.order);

    return (
        <div className="min-h-screen bg-white">
            {sorted.map((section) => {
                const CustomComponent = customPreviews[section.type];
                if (CustomComponent) {
                    return <CustomComponent key={section.id} section={section} />;
                }
                return <GenericSectionPreview key={section.id} section={section} />;
            })}
        </div>
    );
};
