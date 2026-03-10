
export interface CMSImage {
    url: string;
    alt?: string;
    type?: string;
    width?: number;
    height?: number;
    src?: string;
}

export interface CMSMetaData {
    slug: string;
    title: string;
    description: string;
    keywords: string;
    author: string;
    ogTags?: {
        ogTitle: string;
        ogDescription: string;
        ogKeywords: string;
        ogUrl: string;
        ogImage: CMSImage;
        ogType: string;
        ogLocale: string;
        ogSiteName: string;
    };
}

export interface CMSNavItem {
    label: string;
    slug: string;
    href: string;
    subItems?: CMSNavItem[];
}

export interface CMSFooterNavData {
    group1: CMSNavItem[];
    socialLinks: { icon: string; href: string }[];
    copyright: string;
    rc: string;
    footerLogo: string;
}

export interface CMSContactUsCardData {
    title: string;
    titleColor: string;
    backgroundImage: string;
    cardColor: string;
    description: string;
    textColor: string;
    button: {
        color: string;
        backgroundColor: string;
        text: string;
        icon: string;
        link: string;
    };
}

export interface CMSHomeHeroCardData {
    cardTitle: string;
    cardDescription: string;
    cardImages: {
        mainImage: CMSImage;
        subImage1: CMSImage;
        subImage2: CMSImage;
        subCardColor: string;
    };
    backgroundColor: string;
    cardColor: string;
    button: {
        color: string;
        backgroundColor: string;
        text: string;
        icon: string;
        link: string;
    };
}

export interface CMSAboutHeroData {
    topTitle: {
        first: string;
        second: string;
    };
    bottomTitle: string;
    description: string;
    image: CMSImage;
}

export interface CMSServiceItemData {
    index: number;
    TextTitle1: string;
    TextTitle2: string;
    TextDescription: string;
    image: string;
    imageAlt: string;
}

export interface CMSServicesListData {
    slug: string;
    title: string;
    description: string;
    bannerImage: string;
    bannerImageAlt: string;
    servicesContent: CMSServiceItemData[];
}

export interface CMSPagesData {
    home?: {
        heroCardData: CMSHomeHeroCardData[];
    };
    about?: {
        aboutEleastarHeroData: CMSAboutHeroData;
    };
    services?: {
        servicesListData: CMSServicesListData[];
    };
    [key: string]: unknown;
}

export interface CMSData {
    metaData: CMSMetaData[];
    navData: CMSNavItem[];
    footerNavData: CMSFooterNavData;
    contactUsCardData: CMSContactUsCardData;
    pages: CMSPagesData;
}

export type SectionType =
    | 'Hero'
    | 'About'
    | 'Approach'
    | 'Services'
    | 'KnowMore'
    | 'NewestTech'
    | 'Contact'
    | 'News'
    | 'CEOQuote'
    // About page
    | 'AboutHero'
    | 'OurMission'
    | 'TeamNarrative'
    | 'MeetTeam'
    | 'JoinTeam'
    // Services page
    | 'ServicesHero'
    | 'ServiceBlock'
    | 'ContactCTA'
    | 'ServiceDetailHero'
    | 'ServiceDetailOverview'
    | 'ServiceDetailOffering'
    | 'ServiceDetailContact'
    | 'CareersHero';

export type CMSPageSlug =
    | 'Home'
    | 'About'
    | 'Services'
    | 'IndustrialSolutions'
    | 'InformationTechnology'
    | 'ResearchAndDevelopment'
    | 'ElectronicsManufacturing'
    | 'SpecificITServices'
    | 'PrivacyPolicy'
    | 'TermsOfService'
    | 'Careers';

/** Common base fields shared by all CMS content sections */
export interface BaseSection {
    id: string;
    type: SectionType;
    page: CMSPageSlug;
    isVisible: boolean;
    /** 1-indexed display order within the page */
    order: number;
    lastUpdated: string;
    status: 'Published' | 'Draft';
}

// ---------------------------------------------------------------------------
// Home Page Sections
// ---------------------------------------------------------------------------

export interface HeroSection extends BaseSection {
    type: 'Hero';
    cards: {
        id: string;
        headline: string;
        subheadline: string;
        ctaLabel: string;
        ctaLink: string;
        imageUrl: string;
        altText?: string;
    }[];
}

export interface AboutSection extends BaseSection {
    type: 'About';
    title: string;
    text: string;
    ctaLabel: string;
    ctaLink: string;
    imageUrl: string;
    altText?: string;
}

export interface ServicesSection extends BaseSection {
    type: 'Services';
    title: string;
    subtitle: string;
    services: {
        id: string;
        title: string;
        description: string;
    }[];
    ctaLabel: string;
    ctaLink: string;
}

export interface KnowMoreSection extends BaseSection {
    type: 'KnowMore';
    title: string;
    highlight: string;
    description: string;
    ctaLabel: string;
    ctaLink: string;
    imageUrl: string;
    altText?: string;
}

export interface ApproachSection extends BaseSection {
    type: 'Approach';
    title: string;
    subtitle: string;
    steps: {
        id: string;
        title: string;
        description: string;
    }[];
    ctaLabel: string;
    ctaLink: string;
}

export interface NewestTechSection extends BaseSection {
    type: 'NewestTech';
    title: string;
    subtitle: string;
    description: string;
    ctaLabel: string;
    ctaLink: string;
    showAndroid: boolean;
    showIOS: boolean;
    imageUrl: string;
    altText?: string;
}

export interface ContactSection extends BaseSection {
    type: 'Contact';
    title: string;
    subtitle: string;
    intro: string;
    privacyText: string;
}

export interface NewsSection extends BaseSection {
    type: 'News';
    title: string;
    newsItems: {
        id: string;
        title: string;
        summary: string;
        category: string;
        imageUrl: string;
        link: string;
    }[];
    ctaLabel: string;
    ctaLink: string;
}

export interface CEOQuoteSection extends BaseSection {
    type: 'CEOQuote';
    title: string;
    quote: string;
    authorName: string;
    authorTitle: string;
    imageUrl: string;
    altText?: string;
}

/** Discriminated union of all homepage content sections */
export type HomepageSection =
    | HeroSection
    | AboutSection
    | ServicesSection
    | KnowMoreSection
    | ApproachSection
    | NewestTechSection
    | ContactSection
    | NewsSection
    | CEOQuoteSection;

// ---------------------------------------------------------------------------
// About Page Sections
// ---------------------------------------------------------------------------

export interface AboutHeroSection extends BaseSection {
    type: 'AboutHero';
    title: string;
    subtitle: string;
    description: string;
    imageUrl: string;
    altText?: string;
}

export interface OurMissionSection extends BaseSection {
    type: 'OurMission';
    title?: string;
    missionTitle: string;
    missionText: string;
    visionTitle: string;
    visionText: string;
    imageUrl: string;
    altText?: string;
}

export interface TeamNarrativeSection extends BaseSection {
    type: 'TeamNarrative';
    title: string;
    text: string;
    imageUrl: string;
    altText?: string;
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    imageUrl: string;
    altText?: string;
    bio?: string;
    generatedAt?: string;
    processedAt?: string;
    paidAt?: string;
    transactionId?: string;
    linkedinUrl?: string;
}

export interface MeetTeamSection extends BaseSection {
    type: 'MeetTeam';
    title: string;
    subtitle: string;
    members: TeamMember[];
}

export interface JoinTeamCTASection extends BaseSection {
    type: 'JoinTeam';
    title: string;
    text: string;
    ctaLabel: string;
    ctaLink: string;
    imageUrl: string;
    altText?: string;
}

export interface ContactCTASection extends BaseSection {
    type: 'ContactCTA';
    title: string;
    text: string;
    ctaLabel: string;
    ctaLink: string;
}

// ---------------------------------------------------------------------------
// Services Page Sections
// ---------------------------------------------------------------------------

export interface ServicesHeroSection extends BaseSection {
    type: 'ServicesHero';
    page: 'Services';
    title: string;
    headline: string;
    description: string;
    imageUrl: string;
    altText?: string;
}

export interface ServiceBlockSection extends BaseSection {
    type: 'ServiceBlock';
    page: 'Services';
    serviceTitle: string;
    /** Supports newline-separated or HTML multi-paragraph content */
    description: string;
    ctaLabel: string;
    ctaLink: string;
    imageUrl: string;
    altText?: string;
}

// ---------------------------------------------------------------------------
// Service Detail Page Sections
// ---------------------------------------------------------------------------

export type ServiceDetailPage =
    | 'IndustrialSolutions'
    | 'InformationTechnology'
    | 'ResearchAndDevelopment'
    | 'ElectronicsManufacturing'
    | 'SpecificITServices';

export interface ServiceDetailHeroSection extends BaseSection {
    type: 'ServiceDetailHero';
    page: ServiceDetailPage;
    title: string;
    intro: string;
}

export interface ServiceDetailOverviewSection extends BaseSection {
    type: 'ServiceDetailOverview';
    page: ServiceDetailPage;
    imageUrl: string;
    altText: string;
}

export interface ServiceDetailOfferingSection extends BaseSection {
    type: 'ServiceDetailOffering';
    page: ServiceDetailPage;
    number: string;
    title: string;
    description: string;
    imageUrl: string;
    altText?: string;
    ctaLabel?: string;
    ctaLink?: string;
}

export interface ServiceDetailContactSection extends BaseSection {
    type: 'ServiceDetailContact';
    page: ServiceDetailPage;
    title: string;
    description: string;
    ctaLabel: string;
    ctaLink: string;
}

// ---------------------------------------------------------------------------
// Careers Page Section
// ---------------------------------------------------------------------------

export interface CareersHeroSection extends BaseSection {
    type: 'CareersHero';
    page: 'Careers';
    title: string;
    body: string;
    imageUrl?: string;
}

// ---------------------------------------------------------------------------
// Master CMS Section Union
// ---------------------------------------------------------------------------

/** Discriminated union of every possible CMS content section */
export type CMSSection =
    | HeroSection
    | AboutSection
    | ApproachSection
    | ServicesSection
    | KnowMoreSection
    | NewestTechSection
    | ContactSection
    | NewsSection
    | CEOQuoteSection
    | AboutHeroSection
    | OurMissionSection
    | TeamNarrativeSection
    | MeetTeamSection
    | JoinTeamCTASection
    | ContactCTASection
    | ServicesHeroSection
    | ServiceBlockSection
    | ServiceDetailHeroSection
    | ServiceDetailOverviewSection
    | ServiceDetailOfferingSection
    | ServiceDetailContactSection
    | CareersHeroSection;

// ---------------------------------------------------------------------------
// Global Site Settings & Pages
// ---------------------------------------------------------------------------

export interface GlobalContent {
    tenantId: string;
    siteName: string;
    logoUrl: string;
    faviconUrl: string;
    navigation: {
        id: string;
        label: string;
        path: string;
        type: 'Internal' | 'External';
        isVisible: boolean;
        order: number;
    }[];
    seoDefaults: {
        siteTitle: string;
        siteDescription: string;
        ogImage: string;
        twitterHandle?: string;
    };
    contactInfo: {
        email: string;
        phone: string;
        address: string;
    };
    socialLinks: {
        linkedin: string;
        facebook: string;
        twitter: string;
        instagram: string;
    };
    metaDescription: string;
    metaKeywords: string;
}

export interface PageMetadata {
    /** Matches a Page ID, e.g. 'Home' */
    id: string;
    tenantId: string;
    /** Canonical path */
    path: string;
    metaTitle: string;
    metaDescription: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    noIndex: boolean;
}

export interface SEOMetadata {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    noIndex: boolean;
}

export interface CMSPage {
    id: string;
    tenantId: string;
    slug: string;
    name: string;
    status: 'Published' | 'Draft';
    seo: SEOMetadata;
    sections: CMSSection[];
    lastUpdated: string;
}

// ---------------------------------------------------------------------------
// Services Collection
// ---------------------------------------------------------------------------

export interface ServiceContentBlock {
    id: string;
    type: 'Feature' | 'Benefit' | 'Process' | 'Standard';
    title1: string;
    title2?: string;
    description: string;
    imageUrl?: string;
    imageAlt?: string;
    order: number;
}

export interface ServiceItem {
    id: string;
    tenantId: string;
    slug: string;
    title: string;
    shortDescription: string;
    /** URL or Lucide icon name */
    icon: string;
    bannerImage: string;
    bannerAlt: string;
    contentBlocks: ServiceContentBlock[];
    seo?: Partial<PageMetadata>;
    status: 'Published' | 'Draft';
    lastUpdated: string;
}

export type ServiceCollection = ServiceItem[];

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

export interface FooterLink {
    id: string;
    label: string;
    url: string;
    isVisible: boolean;
}

export interface FooterSection {
    id: string;
    lastUpdated: string;
    title?: string;
    links?: FooterLink[];
    /** For legal text, copyright RC number, etc. */
    content?: string;
}

export interface FooterContent {
    navigation: FooterSection;
    utility: FooterSection;
    social: FooterSection;
    legal: FooterSection;
    copyright: FooterSection;
}

// ---------------------------------------------------------------------------
// CMS Admin Module Types (route-local types used in the CMS admin page)
// ---------------------------------------------------------------------------

export type CMSModule = 'pages' | 'menus' | 'apikeys' | 'settings' | 'media';

export interface CMSApiKey {
    id: string;
    name: string;
    key: string;
    is_active: boolean;
    created_at: string;
}

export interface CMSMenuItem {
    id: string;
    label: string;
    url: string;
    order: number;
    is_visible: boolean;
    parent_id?: string;
    children?: CMSMenuItem[];
}

export interface CMSMenu {
    id: string;
    name: string;
    key: string;
    items: CMSMenuItem[];
}

export interface CMSPageLink {
    id: string | number;
    name: string;
    slug: string;
}

/** Backend section content shapes (GET /page/:slug response) */
export interface ServiceDetailHeroContent {
    page_title?: string;
    intro_text?: string;
}

export interface ServiceDetailOverviewContent {
    overview_image?: { url: string; alt?: string };
}

export interface ServiceDetailOfferingContent {
    number?: string;
    title?: string;
    description?: string;
    image?: { url: string; alt?: string };
}

export interface ServiceDetailContactContent {
    title?: string;
    description?: string;
    cta_label?: string;
    cta_link?: string;
}

/** Backend section format (embedded in CMSPageDetail) */
export interface CMSPageSection {
    id: number;
    page_id: number;
    section_key: string;
    type: string;
    label: string;
    order: number;
    status: 'published' | 'draft';
    content: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

/** Full page response from GET /portal/cms/pages/:slug */
export interface CMSPageDetail {
    id: number;
    parent_id: number | null;
    slug: string;
    name: string;
    status: 'live' | 'draft';
    is_sub_page: boolean;
    order: number;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    meta_author: string;
    og_title: string;
    og_description: string;
    og_image_url: string;
    og_image_alt: string;
    og_type: string;
    og_url: string;
    created_at: string;
    updated_at: string;
    sections: CMSPageSection[];
    parent: CMSPageParent | null;
    children: CMSPageDetail[];
}

export interface CMSPageParent {
    id: number;
    parent_id: number | null;
    slug: string;
    name: string;
    status: 'live' | 'draft';
    is_sub_page: boolean;
    order: number;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    meta_author: string;
    og_title: string;
    og_description: string;
    og_image_url: string;
    og_image_alt: string;
    og_type: string;
    og_url: string;
    created_at: string;
    updated_at: string;
}

export interface CMSPageItem {
    id: string | number;
    parent_id?: string | number;
    slug: string;
    name: string;
    status: 'live' | 'draft';
    is_sub_page: boolean;
    order: number;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    meta_author: string;
    og_title: string;
    og_description: string;
    og_image_url: string;
    og_image_alt: string;
    og_type: string;
    og_url: string;
    created_at: string;
    updated_at: string;
    sections_count: number;
    children_count: number;
    parent: CMSPageLink | null;
}

