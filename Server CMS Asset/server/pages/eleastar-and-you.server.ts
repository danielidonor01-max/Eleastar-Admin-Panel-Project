import type { HeroPagesProps } from "@/lib/types/home";

const eleastarAndYouHeroData: HeroPagesProps = {
    topTitle:{
      first: 'Eleastar Career',
      second: 'Portal'
    },
    bottomTitle: "Build the Future of Africa with Eleastar.",
    description: "We change the game when we find each other From small scale to global community. Learn more about how skateboarding communities are connecting the world.",
    image: { src: "/images/hero/eleastar-and-you-hero.png", alt: "Eleastar and You Hero" }
  }


export const getEleastarAndYouHeroData = async (): Promise<HeroPagesProps> => {
    const data = eleastarAndYouHeroData as HeroPagesProps;
    if (!data) {
        throw new Error(`Eleastar and You hero data not found`);
    }
    return data;
}