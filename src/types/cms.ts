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
    socialLinks: { icon: string; href: string; }[];
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
    image: string; // The schema has this as a string URL
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
    // Let's allow flexibility for other pages
    [key: string]: any;
}

export interface CMSData {
    metaData: CMSMetaData[];
    navData: CMSNavItem[];
    footerNavData: CMSFooterNavData;
    contactUsCardData: CMSContactUsCardData;
    pages: CMSPagesData;
}
