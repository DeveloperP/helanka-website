import type { Metadata } from "next";
import GroupExperiencesClient from "./group-experiences-client";

export const metadata: Metadata = {
  title: "Group Experiences",
  description:
    "Incentive trips, cricket tours, rugby tours, and golf holidays: curated group experiences across Sri Lanka.",
};

export default function GroupExperiencesPage() {
  return <GroupExperiencesClient />;
}
