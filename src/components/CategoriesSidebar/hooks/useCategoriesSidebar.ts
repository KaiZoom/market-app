import { useState, useCallback } from 'react';
import {
  Utensils,
  GlassWater,
  Sparkles,
  ShowerHead,
  Croissant,
  Drumstick,
  Apple,
  Sandwich,
  Milk,
  Snowflake,
  ShoppingBag,
  Package,
} from 'lucide-react-native';

export function getCategoryIcon(category: string): { Icon: any; color: string } {
  const iconMap: Record<string, { Icon: any; color: string }> = {
    Alimentos: { Icon: Utensils, color: '#FF9800' },
    Bebidas: { Icon: GlassWater, color: '#2196F3' },
    Limpeza: { Icon: Sparkles, color: '#00BCD4' },
    Higiene: { Icon: ShowerHead, color: '#9C27B0' },
    Padaria: { Icon: Croissant, color: '#FFC107' },
    Açougue: { Icon: Drumstick, color: '#F44336' },
    Hortifruti: { Icon: Apple, color: '#4CAF50' },
    Refrigerados: { Icon: Snowflake, color: '#00ACC1' },
    Frios: { Icon: Sandwich, color: '#FFEB3B' },
    Laticínios: { Icon: Milk, color: '#E0E0E0' },
    Mercearia: { Icon: ShoppingBag, color: '#795548' },
  };
  return iconMap[category] || { Icon: Package, color: '#757575' };
}

export function useCategoriesSidebar() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const hoverProps = useCallback((id: string) => ({
    onMouseEnter: () => setHoveredCategory(id),
    onMouseLeave: () => setHoveredCategory(null),
  }), []);

  return { hoveredCategory, hoverProps };
}
