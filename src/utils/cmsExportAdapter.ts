import type { CMSSection, GlobalContent, FooterContent, ServiceCollection } from '../data/mockData';

export function exportCMSToJSON(
    cmsContent: CMSSection[],
    globalContent: GlobalContent,
    servicesCollection: ServiceCollection,
    footerContent: FooterContent
) {
    // 1. Map Navigation
    const navData = globalContent.navigation
        .filter(nav => nav.isVisible)
        .sort((a, b) => a.order - b.order)
        .map(nav => ({
            label: nav.label,
            slug: nav.path.replace(/^\//, '') || 'home',
            href: nav.path,
        }));

    // 2. Map Footer
    const footerNavData = {
        group1: (footerContent.navigation.links || []).filter(l => l.isVisible).map(l => ({
            label: l.label,
            slug: l.url.replace(/^\//, ''),
            href: l.url
        })),
        socialLinks: (footerContent.social.links || []).filter(l => l.isVisible).map(l => ({
            icon: `fi fi-brands-${l.label.toLowerCase()}`,
            href: l.url
        })),
        copyright: footerContent.copyright.content,
        rc: "RC - 7130026",
        footerLogo: globalContent.logoUrl || "/images/footer_logo.png"
    };

    // 3. Map Contact Hero
    const contactSection = cmsContent.find(c => c.type === 'Contact');

    // 4. Map Pages
    const homeSections = cmsContent.filter(c => c.page === 'Home' && c.isVisible).sort((a, b) => a.order - b.order);
    const aboutSections = cmsContent.filter(c => c.page === 'About' && c.isVisible).sort((a, b) => a.order - b.order);

    const mappedHome = {
        heroCardData: homeSections.filter(s => s.type === 'Hero').flatMap((h: any) =>
            h.cards?.map((card: any) => ({
                cardTitle: card.headline,
                cardDescription: card.subheadline,
                cardImages: {
                    mainImage: { src: card.imageUrl, alt: card.altText || "Hero" },
                },
                backgroundColor: "bg-card-1",
                cardColor: "bg-card-2",
                button: {
                    color: "text-card-1",
                    backgroundColor: "bg-white",
                    text: card.ctaLabel,
                    icon: "fi-rr-arrow-right",
                    link: card.ctaLink,
                }
            })) || []
        )
    };

    const aboutHero = aboutSections.find(s => s.type === 'AboutHero') as any;
    const mappedAbout = {
        aboutEleastarHeroData: aboutHero ? {
            topTitle: { first: aboutHero.title || 'Who we are', second: "" },
            bottomTitle: aboutHero.subtitle,
            description: aboutHero.description,
            image: { src: aboutHero.imageUrl, alt: aboutHero.altText || "About Eleastar" }
        } : null
    };

    const mappedServices = {
        servicesListData: servicesCollection.map(svc => ({
            slug: svc.slug,
            title: svc.title,
            description: svc.shortDescription,
            bannerImage: svc.bannerImage,
            bannerImageAlt: svc.bannerAlt,
            servicesContent: svc.contentBlocks?.map((block, idx) => ({
                index: idx + 1,
                TextTitle1: block.title1,
                TextTitle2: block.title2 || "",
                TextDescription: block.description,
                image: block.imageUrl || "",
                imageAlt: block.imageAlt || "Service Image",
            })) || []
        }))
    };

    // Combine all meta tags pseudo-dynamically
    const metaData = [
        {
            slug: "home",
            title: globalContent.seoDefaults.siteTitle,
            description: globalContent.seoDefaults.siteDescription,
            keywords: globalContent.metaKeywords,
            author: globalContent.siteName,
            ogTags: {
                ogTitle: globalContent.seoDefaults.siteTitle,
                ogDescription: globalContent.seoDefaults.siteDescription,
                ogKeywords: globalContent.metaKeywords,
                ogUrl: "https://eleastar.com",
                ogImage: {
                    url: globalContent.seoDefaults.ogImage,
                    alt: "Hero",
                    type: "image/png",
                    width: 1200,
                    height: 630
                },
                ogType: "website",
                ogLocale: "en_US",
                ogSiteName: globalContent.siteName,
            }
        },
        ...servicesCollection.map(svc => ({
            slug: svc.slug,
            title: `${svc.title} | ${globalContent.siteName}`,
            description: svc.shortDescription,
            keywords: `${svc.title.toLowerCase()}, services, technology, solutions`,
            author: globalContent.siteName,
            ogTags: {
                ogTitle: `${svc.title} | ${globalContent.siteName}`,
                ogDescription: svc.shortDescription,
                ogKeywords: `${svc.title.toLowerCase()}, services, technology, solutions`,
                ogUrl: `https://eleastar.com/services/${svc.slug}`,
                ogImage: {
                    url: svc.bannerImage || globalContent.seoDefaults.ogImage,
                    alt: svc.title,
                    type: "image/png",
                    width: 1200,
                    height: 630
                },
                ogType: "website",
                ogLocale: "en_US",
                ogSiteName: globalContent.siteName,
            }
        }))
    ];

    // Final payload
    const exportPayload = {
        metaData,
        navData,
        footerNavData,
        contactUsCardData: contactSection ? {
            title: contactSection.title,
            titleColor: "text-white",
            backgroundImage: "/images/services/contact-bg.png",
            cardColor: "bg-primary-2",
            description: (contactSection as any).intro || (contactSection as any).subtitle || '',
            textColor: "text-white",
            button: {
                color: "text-white",
                backgroundColor: "bg-primary",
                text: "Reach out to us today!",
                icon: "fi fi-rr-arrow-right",
                link: "/contact"
            }
        } : null,
        pages: {
            home: mappedHome,
            about: mappedAbout,
            services: mappedServices
        }
    };

    // Download Logic
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `cms-export-${new Date().getTime()}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}
