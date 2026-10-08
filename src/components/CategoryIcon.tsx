import { Laptop, House, GraduationCap, Palette, Wrench, Truck, Sprout, Car, BookOpen, Leaf, Camera, Flower2, Utensils, Scale, Megaphone, LayoutGrid } from "lucide-react";
export default function CategoryIcon({ category, size = 22 }: { category: string; size?: number }) {
  const icons = [ [/tech|web|software/i, Laptop], [/home|clean/i, House], [/education/i, GraduationCap], [/creative|design/i, Palette], [/repair|electric/i, Wrench], [/delivery/i, Truck], [/agricult/i, Sprout], [/vehicle/i, Car], [/tuition|tutor/i, BookOpen], [/ayurveda/i, Leaf], [/photo/i, Camera], [/beauty|wellness/i, Flower2], [/event|catering/i, Utensils], [/legal|finance/i, Scale], [/marketing/i, Megaphone] ] as const;
  const Icon = icons.find(([pattern]) => pattern.test(category))?.[1] ?? LayoutGrid;
  return <Icon size={size} strokeWidth={1.7} aria-hidden="true" />;
}
