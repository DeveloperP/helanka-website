import type { Metadata } from "next";
import AboutContent from "./about-content";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Helanka Vacations is a Sri Lankan tour operator based in Rajagiriya, Colombo. Part of MendisOne Pvt Ltd, we design custom holiday packages with local guides, homestays, and authentic experiences.",
};

export default function AboutPage() {
  return <AboutContent />;
}
