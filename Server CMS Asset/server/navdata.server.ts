import { env } from "$env/dynamic/private";
import type { FooterNavItemProps, NavItemProps } from "../types/navigation";


export const getNavData = async () => {
    const response = await fetch(`${env.API_URL}/get-slugs`);
    const data = await response.json() as NavItemProps[];
    return data;
};


export const navData: NavItemProps[] = [
    {
      label: "Services",
      slug: "services",
      href: "/services",
      subItems: [
        {
          label: "Information Technology Services",
          slug: "information-technology-services",
          href: "/services/information-technology-services",
        },
        {
          label: "Research and Development",
          slug: "research-and-development",
          href: "/services/research-and-development",
        },
        {
          label: "Electronics Manufacturing",
          slug: "electronics-manufacturing",
          href: "/services/electronics-manufacturing",
        },
        {
          label: "Industry Solutions",
          slug: "industry-solutions",
          href: "/services/industry-solutions",
        },
        {
          label: "Specific IT Services",
          slug: "specific-it-services",
          href: "/services/specific-it-services",
        },
      ],
    },

    {
      label: "Technologies",
      slug: "technologies",
      href: "/technologies",
    },
    {
      label: "Eleastar & You",
      slug: "eleastar-and-you",
      href: "/eleastar-and-you",
    },
    {
      label: "About Eleastar",
      slug: "about-eleastar",
      href: "/about-eleastar",
    },
  ];

  const footerNavData: FooterNavItemProps =  {
      group1: [
        {
          label: "Services",
          slug: "services",
          href: "/services",
        },
        {
          label: "Technologies",
          slug: "technologies",
          href: "/technologies",
        },
        {
          label: "Eleastar & You",
          slug: "eleastar-and-you",
          href: "/eleastar-and-you",
        },
        {
          label: "About Eleastar",
          slug: "about-eleastar",
          href: "/about-eleastar",
        },
      ],
      group2: [
        {
          label: "Contact",
          slug: "contact",
          href: "/contact",
        },
        {
          label: "New Updates",
          slug: "new-updates",
          href: "/new-updates",
        },
        {
          label: "Locate Us",
          slug: "locate-us",
          href: "/locate-us",
        },
      ],
      legal: [
        {
          label: "Privacy Policy",
          slug: "privacy-policy",
          href: "/privacy-policy",
        },
        {
          label: "Terms of Service",
          slug: "terms-of-service",
          href: "/terms-of-service",
        },
      ],
      socialLinks:[
        { icon: "fi fi-brands-facebook", href: "/facebook" },
        { icon: "fi fi-brands-twitter-alt", href: "/twitter" },
        { icon: "fi fi-brands-instagram", href: "/instagram" },
        { icon: "fi fi-brands-linkedin", href: "/linkedin" }
      ],
      copyright: "Copyright © " + new Date().getFullYear(),
      rc: "RC - 7130026",
      footerStatement: "We grant you a limited, non-exclusive, non-transferable, revocable license to use the Website and our services for personal, non-commercial use, subject to these Terms. This license does not include any resale of our services or their contents; any collection and use of any product listings, descriptions, or prices; any derivative use of our services or their contents; or any use of data mining, robots, or similar data gathering and extraction tools. You may view, download for caching purposes only, and print pages from the Website for your personal use, subject to the restrictions set out below and elsewhere in these Terms",
      footerLogo: "/images/footer_logo.png",
    }





  export const getHeaderNavData = async (): Promise<NavItemProps[]> => {
    const data = navData as NavItemProps[];
    if (!data) {
        throw new Error(`Header nav data not found`);
    }
    return data;
  }

  export const getFooterData = async (): Promise<FooterNavItemProps> => {
    const data = footerNavData as FooterNavItemProps;
    if (!data) {
        throw new Error(`Footer data not found`);
    }
    return data;
  }