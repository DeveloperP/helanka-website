export const COMMON_ALLERGIES = [
  "Nuts",
  "Shellfish",
  "Dairy",
  "Gluten",
  "Eggs",
  "Soy",
  "Fish",
  "Sesame",
] as const;

export type CommonAllergy = (typeof COMMON_ALLERGIES)[number];

export const MEAL_PLANS = [
  {
    id: "full-board",
    label: "Full Board",
    description: "Breakfast, lunch, and dinner included",
  },
  {
    id: "half-board",
    label: "Half Board",
    description: "Breakfast and dinner included",
  },
  {
    id: "bb",
    label: "Bed & Breakfast",
    description: "Breakfast only",
  },
] as const;

export type MealPlanId = (typeof MEAL_PLANS)[number]["id"];

export interface DietaryPreferences {
  allergies: CommonAllergy[];
  mealPlan: MealPlanId;
  dietaryNotes: string;
}
