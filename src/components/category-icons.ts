import {
  Baby,
  Car,
  Dumbbell,
  Flower2,
  Gamepad2,
  Headphones,
  House,
  PawPrint,
  Search,
  Shirt,
  ShoppingBasket,
  type LucideIcon,
} from "lucide-react";
import type { StoreCategory } from "@/lib/stores";

/** One SVG icon per category, shared by search suggestions and the category directory. */
export const CATEGORY_ICON: Record<StoreCategory, LucideIcon> = {
  electronics: Headphones,
  sports: Dumbbell,
  baby: Baby,
  home: House,
  food: ShoppingBasket,
  gaming: Gamepad2,
  beauty: Flower2,
  auto: Car,
  fashion: Shirt,
  pets: PawPrint,
  general: Search,
};
