export interface AdminCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: number;
  active: boolean;
  createdAt: string;
}

const KEY = "needly_admin_categories";

const DEFAULTS: AdminCategory[] = [
  { id: "cat_1", name: "Technology", icon: "fa-laptop-code", description: "Web, app, and software development services", count: 312, active: true, createdAt: "2024-01-01" },
  { id: "cat_2", name: "Home Services", icon: "fa-house", description: "Cleaning, maintenance, and repairs for your home", count: 284, active: true, createdAt: "2024-01-01" },
  { id: "cat_3", name: "Education", icon: "fa-graduation-cap", description: "Tutoring, courses, and skill training", count: 198, active: true, createdAt: "2024-01-01" },
  { id: "cat_4", name: "Creative", icon: "fa-palette", description: "Graphic design, art, and creative services", count: 176, active: true, createdAt: "2024-01-01" },
  { id: "cat_5", name: "Repairs", icon: "fa-screwdriver-wrench", description: "Appliance, vehicle, and equipment repairs", count: 241, active: true, createdAt: "2024-01-01" },
  { id: "cat_6", name: "Delivery", icon: "fa-truck", description: "Courier, food, and logistics delivery", count: 163, active: true, createdAt: "2024-01-01" },
  { id: "cat_7", name: "Agriculture", icon: "fa-seedling", description: "Farming, pest control, and agricultural support", count: 87, active: true, createdAt: "2024-01-01" },
  { id: "cat_8", name: "Vehicle Service", icon: "fa-car", description: "Car wash, servicing, and transport", count: 145, active: true, createdAt: "2024-01-01" },
  { id: "cat_9", name: "Tuition", icon: "fa-book", description: "School subject tutoring and exam preparation", count: 221, active: true, createdAt: "2024-01-01" },
  { id: "cat_10", name: "Ayurveda Service", icon: "fa-leaf", description: "Traditional medicine and wellness treatments", count: 94, active: true, createdAt: "2024-01-01" },
  { id: "cat_11", name: "Photography", icon: "fa-camera", description: "Events, portraits, and commercial photography", count: 132, active: true, createdAt: "2024-01-01" },
  { id: "cat_12", name: "Beauty & Wellness", icon: "fa-spa", description: "Hair, makeup, and personal care services", count: 118, active: true, createdAt: "2024-01-01" },
  { id: "cat_13", name: "Events & Catering", icon: "fa-cake-candles", description: "Event planning, catering, and decoration", count: 96, active: true, createdAt: "2024-01-01" },
  { id: "cat_14", name: "Legal & Finance", icon: "fa-scale-balanced", description: "Legal advice, accounting, and financial planning", count: 73, active: true, createdAt: "2024-01-01" },
  { id: "cat_15", name: "Marketing", icon: "fa-bullhorn", description: "Digital marketing, SEO, and advertising", count: 109, active: true, createdAt: "2024-01-01" },
];

export function getAdminCategories(): AdminCategory[] {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  localStorage.setItem(KEY, JSON.stringify(DEFAULTS));
  return DEFAULTS;
}

export function saveAdminCategories(cats: AdminCategory[]): void {
  localStorage.setItem(KEY, JSON.stringify(cats));
}

export function addAdminCategory(cat: Omit<AdminCategory, "id" | "createdAt">): AdminCategory {
  const cats = getAdminCategories();
  const newCat: AdminCategory = {
    ...cat,
    id: `cat_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  cats.push(newCat);
  saveAdminCategories(cats);
  return newCat;
}
