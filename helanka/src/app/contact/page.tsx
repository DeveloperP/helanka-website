import type { Metadata } from "next";
import ContactContent from "./contact-content";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Helanka Vacations. Email tours@helanka.co, call +94 11 7400 857, or fill out our inquiry form for a free custom trip consultation.",
};

export default function ContactPage() {
  return <ContactContent />;
}
