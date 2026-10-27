import {
  Utensils, Shirt, Cpu, Palette, GraduationCap, HeartPulse, Camera, Home, Gift, Sprout, Briefcase, Sparkles,
  Car, Wrench, ShoppingBag, Music, Dumbbell, Plane, Leaf, Code,
} from 'lucide-react';

const ICONS = {
  utensils: Utensils, shirt: Shirt, cpu: Cpu, palette: Palette, 'graduation-cap': GraduationCap,
  'heart-pulse': HeartPulse, camera: Camera, home: Home, gift: Gift, sprout: Sprout, briefcase: Briefcase,
  sparkles: Sparkles, car: Car, wrench: Wrench, 'shopping-bag': ShoppingBag, music: Music, dumbbell: Dumbbell,
  plane: Plane, leaf: Leaf, code: Code,
};
export const ICON_NAMES = Object.keys(ICONS);

export default function CategoryIcon({ name, size = 18, ...rest }) {
  const C = ICONS[name] || Sparkles;
  return <C size={size} {...rest} />;
}
