export interface AdminCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  /** Display order in pickers and on the home page */
  order: number;
  /** Inactive categories stay in admin but disappear from public pickers */
  active: boolean;
  createdAt: string;
  /** Live count of active services, joined in by useCategories — never stored */
  serviceCount?: number;
}

const KEY = "needly_admin_categories";

/**
 * Starter set written to Firestore on first run. After seeding, this array is
 * only a fallback for when Firebase is unconfigured — the database is the
 * source of truth and admins edit it from /admin/categories.
 */
export const DEFAULT_CATEGORIES: Omit<AdminCategory, "createdAt">[] = [
  { id: "technology", name: "Technology", icon: "fa-laptop-code", description: "Web, app, and software development services", order: 0, active: true },
  { id: "home-services", name: "Home Services", icon: "fa-house", description: "Cleaning, maintenance, and repairs for your home", order: 1, active: true },
  { id: "education", name: "Education", icon: "fa-graduation-cap", description: "Tutoring, courses, and skill training", order: 2, active: true },
  { id: "creative", name: "Creative", icon: "fa-palette", description: "Graphic design, art, and creative services", order: 3, active: true },
  { id: "repairs", name: "Repairs", icon: "fa-screwdriver-wrench", description: "Appliance, vehicle, and equipment repairs", order: 4, active: true },
  { id: "delivery", name: "Delivery", icon: "fa-truck", description: "Courier, food, and logistics delivery", order: 5, active: true },
  { id: "agriculture", name: "Agriculture", icon: "fa-seedling", description: "Farming, pest control, and agricultural support", order: 6, active: true },
  { id: "vehicle-service", name: "Vehicle Service", icon: "fa-car", description: "Car wash, servicing, and transport", order: 7, active: true },
  { id: "tuition", name: "Tuition", icon: "fa-book", description: "School subject tutoring and exam preparation", order: 8, active: true },
  { id: "ayurveda-service", name: "Ayurveda Service", icon: "fa-leaf", description: "Traditional medicine and wellness treatments", order: 9, active: true },
  { id: "photography", name: "Photography", icon: "fa-camera", description: "Events, portraits, and commercial photography", order: 10, active: true },
  { id: "beauty-wellness", name: "Beauty & Wellness", icon: "fa-spa", description: "Hair, makeup, and personal care services", order: 11, active: true },
  { id: "events-catering", name: "Events & Catering", icon: "fa-cake-candles", description: "Event planning, catering, and decoration", order: 12, active: true },
  { id: "legal-finance", name: "Legal & Finance", icon: "fa-scale-balanced", description: "Legal advice, accounting, and financial planning", order: 13, active: true },
  { id: "marketing", name: "Marketing", icon: "fa-bullhorn", description: "Digital marketing, SEO, and advertising", order: 14, active: true },
];

function withCreatedAt(cats: Omit<AdminCategory, "createdAt">[]): AdminCategory[] {
  const now = new Date().toISOString();
  return cats.map((c) => ({ ...c, createdAt: now }));
}
