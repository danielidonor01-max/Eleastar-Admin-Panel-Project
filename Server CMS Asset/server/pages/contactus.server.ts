import type { HeroPagesProps } from "@/lib/types/home"

const contactUsHeroData={
      topTitle:{
        first: 'Contact',
        second: ''
      },
      bottomTitle: "Get in touch with us now",
      description: "Thank you for your interest in Eleastar. Whether you’re a client, job seeker, journalist, analyst or investor, you can find the best way to contact us below.",
      image: {
        src: "/images/hero/contact-us-hero.png",
        alt: "Contact Us Hero"
      }
    }

export const getContactUsHeroData = async (): Promise<HeroPagesProps> => {
    const data = contactUsHeroData as HeroPagesProps;
    if (!data) {
        throw new Error(`Contact us hero data not found`);
    }
    return data;
}