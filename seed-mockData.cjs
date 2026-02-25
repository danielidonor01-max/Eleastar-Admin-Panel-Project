const fs = require('fs');

const mockDataPath = './src/data/mockData.ts';
let content = fs.readFileSync(mockDataPath, 'utf8');

// 1. Replace Global Content
const newGlobalContent = `export const initialGlobalContent: GlobalContent = {
    tenantId: 'tenant-default',
    siteName: 'Eleastar',
    logoUrl: '/images/footer_logo.png',
    faviconUrl: '/favicon.ico',
    contactInfo: {
        email: 'info@eleastar.com',
        phone: '+234 800 123 4567',
        address: '123 Innovation Drive, Lagos, Nigeria'
    },
    socialLinks: {
        linkedin: 'https://linkedin.com/company/eleastar',
        facebook: '/facebook',
        twitter: '/twitter',
        instagram: '/instagram'
    },
    metaDescription: 'Eleastar is a leading provider of technology solutions for businesses and organizations',
    metaKeywords: 'Eleastar, technology, solutions, business, organization',
    navigation: [
        { id: 'nav-services', label: 'Services', path: '/services', type: 'Internal', isVisible: true, order: 1 },
        { id: 'nav-technologies', label: 'Technologies', path: '/technologies', type: 'Internal', isVisible: true, order: 2 },
        { id: 'nav-culture', label: 'Eleastar & You', path: '/eleastar-and-you', type: 'Internal', isVisible: true, order: 3 },
        { id: 'nav-about', label: 'About Eleastar', path: '/about-eleastar', type: 'Internal', isVisible: true, order: 4 },
        { id: 'nav-contact', label: 'Contact Us', path: '/contact', type: 'Internal', isVisible: true, order: 5 },
    ],
    seoDefaults: {
        siteTitle: 'Welcome to Eleastar Technologies Ltd.',
        siteDescription: 'Eleastar is a leading provider of technology solutions for businesses and organizations',
        ogImage: '/images/hero/1.png',
    },
};`;

content = content.replace(/export const initialGlobalContent: GlobalContent = \{[\s\S]*?\n\};\n/m, newGlobalContent + '\n');

// 2. Insert new Services Collection
const newServicesCollection = `export const initialServicesCollection: ServiceItem[] = [
    {
        id: 'svc-information-technology',
        tenantId: 'tenant-default',
        slug: 'information-technology-services',
        title: 'Information Technology Services',
        shortDescription: 'We provide a wide range of IT services to enhance operational efficiency and drive business growth.',
        icon: 'Server',
        bannerImage: '/images/services/information-tech.png',
        bannerAlt: 'Information Technology Services',
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        contentBlocks: [
            { id: 'sb-it-1', type: 'Feature', title1: 'Software Development', title2: '01', description: 'Develop custom software solutions for various industries.', imageUrl: '/images/services/it-services/software-development.png', order: 1 }
        ]
    },
    {
        id: 'svc-research-development',
        tenantId: 'tenant-default',
        slug: 'research-and-development',
        title: 'Research and Development',
        shortDescription: 'We provide a wide range of research and development services to help businesses innovate and grow.',
        icon: 'Microscope',
        bannerImage: '/images/services/research-and-dev.png',
        bannerAlt: 'Research and Development',
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        contentBlocks: [
            { id: 'sb-rd-1', type: 'Feature', title1: 'Innovative Product Development', title2: '01', description: 'Develop innovative products to help businesses grow.', imageUrl: '/images/services/research-and-development/innovative-product-development.png', order: 1 }
        ]
    },
    {
        id: 'svc-electronics-manufacturing',
        tenantId: 'tenant-default',
        slug: 'electronics-manufacturing',
        title: 'Electronics Manufacturing',
        shortDescription: 'We provide electronics manufacturing services to help businesses innovate and grow.',
        icon: 'Cpu',
        bannerImage: '/images/services/electronics-manufacturing.png',
        bannerAlt: 'Electronics Manufacturing',
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        contentBlocks: [
            { id: 'sb-em-1', type: 'Feature', title1: 'Electronic Components and Devices', title2: '01', description: 'Source and manufacture electronic components and devices.', imageUrl: '/images/services/electronics-manufacturing/electronic-components-and-devices.png', order: 1 }
        ]
    },
    {
        id: 'svc-industry-solutions',
        tenantId: 'tenant-default',
        slug: 'industry-solutions',
        title: 'Industry Solutions',
        shortDescription: 'We provide industry solutions to help businesses innovate and grow.',
        icon: 'Factory',
        bannerImage: '/images/services/industry-solutions.png',
        bannerAlt: 'Industry Solutions',
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        contentBlocks: [
            { id: 'sb-is-1', type: 'Feature', title1: 'Technological Solutions for Industries', title2: '01', description: 'Provide technological solutions for industries.', imageUrl: '/images/services/industry-solutions/technological-solutions-for-industries.png', order: 1 }
        ]
    },
    {
        id: 'svc-specific-it',
        tenantId: 'tenant-default',
        slug: 'specific-it-services',
        title: 'Specific IT Services',
        shortDescription: 'We provide specific IT services to help businesses innovate and grow.',
        icon: 'Monitor',
        bannerImage: '/images/services/specific-it-services.png',
        bannerAlt: 'Specific IT Services',
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        contentBlocks: [
            { id: 'sb-sit-1', type: 'Feature', title1: 'E-commerce Solutions', title2: '01', description: 'Develop robust e-commerce platforms.', imageUrl: '/images/services/specific-it-services/ecommerce-solutions.png', order: 1 }
        ]
    }
];`;

content = content.replace(/export const initialServicesCollection: ServiceItem\[\] = \[[\s\S]*?^\];/m, newServicesCollection);


// 3. Update initialCMSContent (Hero Section Only)
const heroSectionMatch = content.match(/\{\s*id:\s*'sec-hero'[\s\S]*?altText:\s*'Hero'\s*\}\s*\]\s*\}/m);
if (heroSectionMatch) {
    const newHeroSection = `{
        id: 'sec-hero',
        type: 'Hero',
        page: 'Home',
        isVisible: true,
        order: 1,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        content: {
            slides: [
                {
                    id: 'hc-1',
                    headline: 'Driving Innovation, Delivering Excellence',
                    subheadline: 'Discover our comprehensive IT services, cutting-edge research, and tailored industrial solutions.',
                    ctaLabel: 'Learn More',
                    ctaLink: '/services/information-technology-services',
                    imageUrl: '/images/hero/1.png',
                    altText: 'Hero'
                },
                {
                    id: 'hc-2',
                    headline: 'Transforming Ideas into Reality',
                    subheadline: 'Discover our comprehensive IT services, cutting-edge research, and tailored industrial solutions.',
                    ctaLabel: 'Learn More',
                    ctaLink: '/services/information-technology-services',
                    imageUrl: '/images/hero/1.png',
                    altText: 'Hero'
                },
                {
                    id: 'hc-3',
                    headline: 'Your Partner in Technology Excellence',
                    subheadline: 'Discover our comprehensive IT services, cutting-edge research, and tailored industrial solutions.',
                    ctaLabel: 'Learn More',
                    ctaLink: '/services/information-technology-services',
                    imageUrl: '/images/hero/1.png',
                    altText: 'Hero'
                }
            ]
        }
    }`;
    content = content.replace(heroSectionMatch[0], newHeroSection);
}

// 4. Update initialAboutContent (AboutHero Section Only)
const aboutHeroMatch = content.match(/\{\s*id:\s*'about-hero'[\s\S]*?altText:\s*'About Eleastar'\s*\}/m);
if (aboutHeroMatch) {
    const newAboutHero = `{
        id: 'about-hero',
        type: 'AboutHero',
        page: 'About',
        isVisible: true,
        order: 1,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        content: {
            title: 'Who we are',
            subtitle: 'Explore Eleastar Technologies LTD.',
            description: 'Eleastar partners with companies to transform and manage their business by unlocking the value of technology.',
            image: {
                url: '/images/hero/about-eleastar-hero.png',
                alt: 'About Eleastar'
            }
        }
    }`;
    content = content.replace(aboutHeroMatch[0], newAboutHero);
}


fs.writeFileSync(mockDataPath, content, 'utf8');
console.log('Successfully seeded all CMS Data segments into mockData.ts with fixed structure!');
