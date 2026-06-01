import type { Metadata } from "next";
import GroupExperiencesClient from "./group-experiences-client";

export const metadata: Metadata = {
  title: "Group Experiences",
  description:
    "Corporate retreats, weddings, school expeditions, and family reunions: curated group travel across Sri Lanka.",
};

export default function GroupExperiencesPage() {
  return <GroupExperiencesClient />;
}
