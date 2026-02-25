import type { HeroCardProps } from "../../types/home";

const heroCardData: HeroCardProps[] = [
    {
      cardTitle: "Driving Innovation, Delivering Excellence",
      cardDescription:
        "Discover our comprehensive IT services, cutting-edge research, and tailored industrial solutions.",
      cardImages: {
        mainImage: { src: "/images/hero/1.png", alt: "Hero" },
        subImage1: { src: "/images/hero/home-2.png", alt: "Hero" },
        subImage2: { src: "/images/hero/home-2.png", alt: "Hero" },
        subCardColor: "bg-card-2",
      },
      backgroundColor: "bg-card-1",
      cardColor: "bg-card-2",
      button: {
        color: "text-card-1",
        backgroundColor: "bg-white",
        text: "Learn More",
        icon: "fi-rr-arrow-right",
        link: "/services/information-technology-services",
      },
    },
    {
      cardTitle: "Transforming Ideas into Reality",
      cardDescription:
        "Discover our comprehensive IT services, cutting-edge research, and tailored industrial solutions.",
      cardImages: {
        mainImage: { src: "/images/hero/1.png", alt: "Hero" },
        subImage1: { src: "/images/hero/home-2.png", alt: "Hero" },
        subImage2: { src: "/images/hero/home-2.png", alt: "Hero" },
        subCardColor: "bg-card-1",
      },
      backgroundColor: "bg-card-2",
      cardColor: "bg-card-1",
      button: {
        color: "text-card-2",
        backgroundColor: "bg-white",
        text: "Learn More",
        icon: "fi-rr-arrow-right",
        link: "/services/information-technology-services",
      },
    },
    {
      cardTitle: "Your Partner in Technology Excellence",
      cardDescription:
        "Discover our comprehensive IT services, cutting-edge research, and tailored industrial solutions.",
      cardImages: {
        mainImage: { src: "/images/hero/1.png", alt: "Hero" },
        subImage1: { src: "/images/hero/home-2.png", alt: "Hero" },
        subImage2: { src: "/images/hero/home-2.png", alt: "Hero" },
        subCardColor: "bg-card-1",
      },
      backgroundColor: "bg-primary-2",
      cardColor: "bg-card-1",
      button: {
        color: "text-white",
        backgroundColor: "bg-card-1",
        text: "Learn More",
        icon: "fi-rr-arrow-right",
        link: "/services/information-technology-services",
      },
    },
  ];

export const getHeroCardData = async (): Promise<HeroCardProps[]> => {
    const data = heroCardData as HeroCardProps[];
    if (!data) {
        throw new Error(`Hero card data not found`);
    }
    return data;
}