/**
 * Optional: predefined section types (not used by default).
 * Call registerDefaultCMSTypes() from main.tsx if you want these example types.
 * Otherwise the CMS is fully generic: types come from existing sections + "Custom section...".
 */
import { registerSectionType } from './sectionTypes';
import { registerSectionPreview } from './preview';
import { ServiceDetailHeroPreview } from './preview/ServiceDetailHeroPreview';
import { ServiceDetailOverviewPreview } from './preview/ServiceDetailOverviewPreview';
import { ServiceDetailOfferingPreview } from './preview/ServiceDetailOfferingPreview';
import { ServiceDetailContactPreview } from './preview/ServiceDetailContactPreview';

/** Call this at app init to register known section types. Add/remove to match your backend. */
export function registerDefaultCMSTypes(): void {
    registerSectionType({
        type: 'ServiceDetailHero',
        label: 'Hero',
        defaultContent: { page_title: '', intro_text: '' },
    });
    registerSectionType({
        type: 'ServiceDetailOverview',
        label: 'Overview with Image',
        defaultContent: { overview_image: { url: '', alt: '' } },
    });
    registerSectionType({
        type: 'ServiceDetailOffering',
        label: 'Offering / Feature Card',
        defaultContent: { number: '01', title: '', description: '', image: { url: '', alt: '' } },
    });
    registerSectionType({
        type: 'ServiceDetailContact',
        label: 'Contact CTA',
        defaultContent: { title: 'Contact Us', description: '', cta_label: 'Get in Touch', cta_link: '/contact' },
    });

    registerSectionPreview('ServiceDetailHero', ServiceDetailHeroPreview);
    registerSectionPreview('ServiceDetailOverview', ServiceDetailOverviewPreview);
    registerSectionPreview('ServiceDetailOffering', ServiceDetailOfferingPreview);
    registerSectionPreview('ServiceDetailContact', ServiceDetailContactPreview);
}
