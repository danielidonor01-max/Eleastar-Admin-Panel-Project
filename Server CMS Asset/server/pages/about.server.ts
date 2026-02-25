import type { HeroPagesProps } from "@/lib/types/home";

const aboutEleastarHeroData: HeroPagesProps = {
    topTitle: {
        first: 'Who we are',
        second: ''
    },
    bottomTitle: "Explore Eleastar Technologies LTD.",
    description: "Eleastar partners with companies to transform and manage their business by unlocking the value of technology.",
    image: { src: "/images/hero/about-eleastar-hero.png", alt: "About Eleastar" }
}

export const getAboutEleastarHeroData = async (): Promise<HeroPagesProps> => {
    const data = aboutEleastarHeroData as HeroPagesProps;
    if (!data) {
        throw new Error(`About Eleastar hero data not found`);
    }
    return data;
}