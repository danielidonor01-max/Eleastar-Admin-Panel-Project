import type { HeroPagesProps } from "@/lib/types/home";
import type { ServicesPageContentProps } from "@/lib/types/services";

const servicePageContentData: ServicesPageContentProps[] = [{
    index: 1,
    bgColor: "bg-card-2",
    textColor: "text-white",
    title1: "Information Technology",
    titleColor: "text-white",
    title2: "Services",
    title2Color: "text-primary-2",
    description: ["We provide a wide range of IT services to enhance operational efficiency and drive business growth. Our offerings include custom software development, IT consulting, cloud computing, cybersecurity, and general IT support.",
        "Our solutions are tailored to meet the unique needs of various industries, ensuring robust, scalable, and user-friendly applications.",
    ],
    image: "/images/services/information-tech.png",
    imageAlt: "Information Technology Services",
    imageflow: "left",
    textflow: "right",
    button: {
        color: "text-white",
        backgroundColor: "bg-primary-2",
        text: "Develop a custom IT solution for your busines",
        icon: "fi-rr-arrow-right",
        link: "/services/information-technology-services",
    },
},
{
    index: 2,
    bgColor: "bg-white",
    textColor: "text-text",
    title1: "Research and",
    titleColor: "text-card-2",
    title2: "Development",
    title2Color: "text-primary-2",
    description: ["Our commitment to innovation is reflected in our R&D efforts. We engage in cutting-edge projects to develop new technologies and improve existing ones. Our focus on advanced data analytics and comprehensive training programs helps clients make data-driven decisions.",
      "We aim to address current industry challenges and anticipate future trends, positioning us as a leader in technological innovation.",
    ],
    image: "/images/services/research-and-dev.png",
    imageAlt: "Research and Development",
    imageflow: "right",
    textflow: "left",
    button: {
      color: "text-white",
      backgroundColor: "bg-primary",
      text: "Be at the forefront of technology.",
      icon: "fi fi-rr-arrow-right",
      link: "/services/research-and-development",
    },
  },
  {
    index: 3,
    bgColor: "bg-card-1",
    textColor: "text-white",
    title1: "Electronics",
    titleColor: "text-white",
    title2: "Manufacturing",
    title2Color: "text-primary-2",
    description: ["We are expanding into the production of high-quality electronic components, devices, and systems. This diversification allows us to offer innovative hardware solutions that meet the evolving needs of our clients.",
      "Our goal is to provide reliable and efficient electronic products that enhance the functionality and performance of various applications.",
    ],
    image: "/images/services/electronics-manufacturing.png",
    imageAlt: "Electronics Manufacturing",
    imageflow: "left",
    textflow: "right",
    button: {
      color: "text-white",
      backgroundColor: "bg-primary-2",
      text: "See how we can support your hardware needs.",
      icon: "fi fi-rr-arrow-right",
      link: "/services/electronics-manufacturing",
    },
},
{
    index: 4,
    bgColor: "bg-white",
    textColor: "text-text",
    title1: "Industrial Solutions",
    titleColor: "text-card-2",
    title2: "Solutions",
    title2Color: "text-primary-2",
    description: ["We offer tailored technological solutions for key industries such as automotive, aerospace, energy, and healthcare. Leveraging our expertise in IT services and R&D, we develop industry-specific solutions that enhance productivity, improve efficiency, and drive innovation.",
      "Our industry-specific IT consulting services help clients implement effective technological solutions that deliver tangible results.",
    ],
    image: "/images/services/industry-solutions.png",
    imageAlt: "Industry Solutions",
    imageflow: "right",
    textflow: "left",
    button: {
      color: "text-white",
      backgroundColor: "bg-primary",
      text: "Learn more about our industry-specific solutions.",
      icon: "fi fi-rr-arrow-right",
      link: "/services/industry-solutions",
    },
  },
  {
    index: 5,
    bgColor: "bg-card-2",
    textColor: "text-white",
    title1: "Specific IT",
    titleColor: "text-white",
    title2: "Services",
    title2Color: "text-primary-2",
  description: ["We provide a wide range of specific IT services to help businesses innovate and grow.",
    "Our specialized IT services include developing robust e-commerce platforms, implementing digital marketing strategies to enhance online presence, and providing outsourcing services to international clients seeking cost-effective IT solutions.",
    "We aim to help businesses operate efficiently online, reach their target audience, and focus on their core activities while we handle their IT needs.",
  ],
  image: "/images/services/specific-it-services.png",
  imageAlt: "Specific IT Services",
  imageflow: "left",
  textflow: "right",
  button: {
    color: "text-white",
    backgroundColor: "bg-primary-2",
    text: "Get specialized IT services.",
    icon: "fi fi-rr-arrow-right",
    link: "/services/specific-it-services",
  },
}
]


const serviceHeroData: HeroPagesProps = {
  topTitle: {
    first: "Our",
    second: "Services"
  },
  bottomTitle: "Our Solutions Are Innovative",
  description: "With The World Becoming Increasingly Intelligent And Entire Value Chains Being Transformed, A Better Experience Is Essential. But It's Not Enough To Just Have This Experience, It Needs To Be Reliable, Efficient And Flexible.",
  image: { src: "/images/hero/services-hero.png", alt: "Services Hero" }
}


export const servicePageContent = async (): Promise<ServicesPageContentProps[]> => {
    const data = servicePageContentData as ServicesPageContentProps[];
    if (!data) {
        throw new Error(`Service page content data not found`);
    }
    return data;
}


export const getServiceHeroData = async (): Promise<HeroPagesProps> => {
    const data = serviceHeroData as HeroPagesProps;
    if (!data) {
        throw new Error(`Service hero data not found`);
    }
    return data;
}