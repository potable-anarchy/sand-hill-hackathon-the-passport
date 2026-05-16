/**
 * Property catalog for Rosewood Sand Hill.
 * Experience names sourced from rosewoodhotels.com/en/sand-hill-menlo-park/experiences.
 * Time slots and unlocks are invented (Rosewood doesn't publish slot-level availability).
 */

export type ExperienceCategory = "dining" | "wellness" | "active" | "cultural" | "entertainment";

export type Experience = {
  id: string;
  name: string;
  category: ExperienceCategory;
  location: string;
  description: string;
  slots: string[];
  durationMinutes: number;
  unlock: string;
  photoRedemptionAppropriate: boolean;
};

export const PROPERTY = {
  name: "Rosewood Sand Hill",
  location: "Menlo Park, CA",
  vibe: "16 acres of cypress, oak, and gardens. Editorial, restrained, never showy.",
  signatureMaterials: ["heirloom carrots", "cypress smoke", "Flamingo Estate teas", "Ridge wines"],
};

export const EXPERIENCES: Experience[] = [
  {
    id: "madera-tasting",
    name: "Tasting at Madera",
    category: "dining",
    location: "Madera Restaurant",
    description: "Chef's seasonal California tasting menu",
    slots: ["Fri 6:30pm", "Sat 6:30pm", "Sat 7:30pm", "Sun 6:30pm"],
    durationMinutes: 150,
    unlock: "Sommelier visit after the third course",
    photoRedemptionAppropriate: true,
  },
  {
    id: "madera-bar",
    name: "Madera Bar",
    category: "dining",
    location: "Madera Bar",
    description: "Craft cocktails and a refreshed bar menu",
    slots: ["Fri 5:00pm", "Fri 9:00pm", "Sat 5:00pm", "Sat 9:00pm"],
    durationMinutes: 90,
    unlock: "Bartender's off-menu pour",
    photoRedemptionAppropriate: true,
  },
  {
    id: "friday-nights-madera",
    name: "Friday Nights @ Madera Bar",
    category: "entertainment",
    location: "Madera Bar",
    description: "Live jazz or DJs spinning vinyl",
    slots: ["Fri 9:00pm"],
    durationMinutes: 120,
    unlock: "Reserved corner booth with view of the band",
    photoRedemptionAppropriate: true,
  },
  {
    id: "afternoon-tea-flamingo",
    name: "Afternoon Tea with Flamingo Estate",
    category: "dining",
    location: "The Library",
    description: "Curated Flamingo Estate teas, savory bites, house-made pastries",
    slots: ["Fri 3:00pm", "Sat 3:00pm", "Sun 3:00pm"],
    durationMinutes: 90,
    unlock: "Take-home tin of the tea you most enjoyed",
    photoRedemptionAppropriate: true,
  },
  {
    id: "bici-coffee",
    name: "Morning coffee at Bici",
    category: "dining",
    location: "Bici Coffee",
    description: "Thoughtfully sourced beans, hyper-seasonal ingredients, fresh pastries",
    slots: ["Sat 7:00am", "Sat 8:00am", "Sun 7:00am", "Sun 8:00am"],
    durationMinutes: 30,
    unlock: "Pastry of the day, on the house",
    photoRedemptionAppropriate: true,
  },
  {
    id: "asaya-spa",
    name: "Asaya Spa treatment",
    category: "wellness",
    location: "Asaya Spa",
    description: "Curated personalized treatment from the Asaya team",
    slots: ["Sat 11:00am", "Sat 2:00pm", "Sat 4:00pm", "Sun 10:00am"],
    durationMinutes: 90,
    unlock: "10-minute add-on, therapist's choice",
    photoRedemptionAppropriate: false,
  },
  {
    id: "pool-access",
    name: "Pool morning",
    category: "wellness",
    location: "Resort pool",
    description: "Heated pool surrounded by cypress",
    slots: ["Sat 8:00am", "Sat 9:00am", "Sun 8:00am", "Sun 9:00am"],
    durationMinutes: 60,
    unlock: "Cold-pressed juice at the cabana",
    photoRedemptionAppropriate: true,
  },
  {
    id: "cycling-concierge",
    name: "Cycling Concierge guided ride",
    category: "active",
    location: "Front entrance",
    description: "Guided ride through Bay Area hills with a Sand Hill cyclist",
    slots: ["Sat 7:30am", "Sun 7:30am"],
    durationMinutes: 120,
    unlock: "Recovery espresso at Bici Coffee",
    photoRedemptionAppropriate: true,
  },
  {
    id: "ridge-rose-reveal",
    name: "Ridge Rosé Reveal",
    category: "cultural",
    location: "Outdoor terrace",
    description: "Unveiling of this year's vintage from Ridge Vineyards",
    slots: ["Sat 5:00pm"],
    durationMinutes: 90,
    unlock: "Signed bottle from the Ridge producer",
    photoRedemptionAppropriate: true,
  },
  {
    id: "clubhouse-perfumer",
    name: "Clubhouse Series: The Perfumer's Practice with Kori Shaw",
    category: "cultural",
    location: "The Library",
    description: "Intimate chat with perfumer Kori Shaw",
    slots: ["Sat 4:00pm"],
    durationMinutes: 60,
    unlock: "Bespoke fragrance sample to take home",
    photoRedemptionAppropriate: true,
  },
];

export const CONCIERGE = {
  name: "James",
  role: "Sand Hill Concierge",
  tone: "low-key efficient, never pushes, surfaces options without insisting; concrete and brief",
};

export function experienceById(id: string): Experience | undefined {
  return EXPERIENCES.find((e) => e.id === id);
}

export function experiencesByCategory(cat: ExperienceCategory): Experience[] {
  return EXPERIENCES.filter((e) => e.category === cat);
}
