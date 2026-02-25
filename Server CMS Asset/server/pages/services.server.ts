import type { ServiceProps } from "@/lib/types/services";

const servicesListData: ServiceProps[] = [
    {
        slug: "information-technology-services",
        title: "Information Technology Services",
        description: "We provide a wide range of IT services to enhance operational efficiency and drive business growth. Our offerings include custom software development, IT consulting, cloud computing, cybersecurity, and general IT support.",
        bannerImage: "/images/services/information-tech.png",
        bannerImageAlt: "Information Technology Services",
        servicesContent: [
            {
                index: 1,
                TextTitle1: "Software",
                TextTitle2: "Development",
                TextDescription: "Develop custom software solutions for various industries, focusing on high-quality, innovative applications.",
                image: "/images/services/it-services/software-development.png",
                imageAlt: "Custom Software Development",
            },
            {
                index: 2,
                TextTitle1: "IT Consulting, Advisory, and",
                TextTitle2: "Training",
                TextDescription: "Provide expert guidance and training to help businesses optimize their IT infrastructure and operations.",
                image: "/images/services/it-services/it-consulting-advisory-training.png",
                imageAlt: "IT Consulting, Advisory, and Training",
            },
            {
                index: 3,
                TextTitle1: "Cloud",
                TextTitle2: "Computing",
                TextDescription: "Deploy scalable cloud solutions to enhance operational efficiency and drive business growth.",
                image: "/images/services/it-services/cloud-computing.png",
                imageAlt: "Cloud Computing",
            },
            {
                index: 4,
                TextTitle1: "Cybersecurity",
                TextTitle2: "",
                TextDescription: "Implement robust cybersecurity measures to protect sensitive data and ensure business continuity.",
                image: "/images/services/it-services/cybersecurity-services.png",
                imageAlt: "Cybersecurity Services",
            },
            {
                index: 5,
                TextTitle1: "General IT",
                TextTitle2: "Services",
                TextDescription: "Provide ongoing support and maintenance to ensure smooth operation and minimize downtime.",
                image: "/images/services/it-services/general-it-services.png",
                imageAlt: "General IT Services",
            }
        ],
    },
    {
        slug: "research-and-development",
        title: "Research and Development",
        description: "We provide a wide range of research and development services to help businesses innovate and grow.",
        bannerImage: "/images/services/research-and-dev.png",
        bannerImageAlt: "Research and Development",
        servicesContent: [
            {
                index: 1,
                TextTitle1: "Innovative",
                TextTitle2: "Product Development",
                TextDescription: "Develop innovative products to help businesses grow and innovate.",
                image: "/images/services/research-and-development/innovative-product-development.png",
                imageAlt: "Innovative Product Development",
            },
            {
                index: 2,
                TextTitle1: "Data Services",
                TextTitle2: "and Training",
                TextDescription: "Provide data services and training to help businesses innovate and grow.",
                image: "/images/services/research-and-development/data-services-and-training.png",
                imageAlt: "Data Services and Training",
            }
        ],
    },
    {
        slug: "electronics-manufacturing",
        title: "Electronics Manufacturing",
        description: "We provide a wide range of electronics manufacturing services to help businesses innovate and grow.",
        bannerImage: "/images/services/electronics-manufacturing.png",
        bannerImageAlt: "Electronics Manufacturing",
        servicesContent: [
            {
                index: 1,
                TextTitle1: "Electronic Components",
                TextTitle2: "and Devices",
                TextDescription: "Source and manufacture electronic components and devices to help businesses innovate and grow.",
                image: "/images/services/electronics-manufacturing/electronic-components-and-devices.png",
                imageAlt: "Electronic Components and Devices",
            }
        ],
    },
    {
        slug: "industry-solutions",
        title: "Industry Solutions",
        description: "We provide a wide range of industry solutions to help businesses innovate and grow.",
        bannerImage: "/images/services/industry-solutions.png",
        bannerImageAlt: "Industry Solutions",
        servicesContent: [
            {
                index: 1,
                TextTitle1: "Technological Solutions for",
                TextTitle2: "Industries",
                TextDescription: "Provide technological solutions for industries such as automotive, aerospace, energy, and healthcare.",
                image: "/images/services/industry-solutions/technological-solutions-for-industries.png",
                imageAlt: "Technological Solutions for Industries",
            },
            {
                index: 2,
                TextTitle1: "IT Consulting for",
                TextTitle2: "Industries",
                TextDescription: "Provide IT consulting for industries such as automotive, aerospace, energy, and healthcare.",
                image: "/images/services/industry-solutions/it-consulting-for-industries.png",
                imageAlt: "IT Consulting for Industries",
            }
        ],
    },
    {
        slug: "specific-it-services",
        title: "Specific IT Services",
        description: "We provide a wide range of specific IT services to help businesses innovate and grow.",
        bannerImage: "/images/services/specific-it-services.png",
        bannerImageAlt: "Specific IT Services",
        servicesContent: [
            {
                index: 1,
                TextTitle1: "E-commerce",
                TextTitle2: "Solutions",
                TextDescription: "Develop robust e-commerce platforms to help businesses innovate and grow.",
                image: "/images/services/specific-it-services/ecommerce-solutions.png",
                imageAlt: "E-commerce Solutions",
            },
            {
                index: 2,
                TextTitle1: "Digital",
                TextTitle2: "Marketing",
                TextDescription: "Implement digital marketing strategies to enhance online presence and drive business growth.",
                image: "/images/services/specific-it-services/digital-marketing.png",
                imageAlt: "Digital Marketing Strategies",
            }
        ],
    },
];












export const servicesContent = async (slug: string): Promise<ServiceProps> => {
    const data = servicesListData.find((service: ServiceProps) => service.slug === slug);
    if (!data) {
        throw new Error(`Service not found: ${slug}`);
    }
    return data;
}