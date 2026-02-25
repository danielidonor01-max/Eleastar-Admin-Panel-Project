import type { ContactUsDataProps } from "@/lib/types/contact";

const contactUsData: ContactUsDataProps = {
    title: "Contact Us",
    titleColor: "text-white",
    backgroundImage: "/images/services/contact-bg.png",
    cardColor: "bg-primary-2",
    description: "Contact us today to learn how Eleastar Technologies Ltd. can support your business with our innovative and comprehensive service offerings.",
    textColor: "text-white",
    button: {
        color: "text-white",
        backgroundColor: "bg-primary",
        text: "Reach out to us today!",
        icon: "fi fi-rr-arrow-right",
        link: "/contact"
    }
}

export const contactUsCardData = async (): Promise<ContactUsDataProps> => {
    const data = contactUsData as ContactUsDataProps;
    if (!data) {
        throw new Error(`Contact us data not found`);
    }
    return data;
}