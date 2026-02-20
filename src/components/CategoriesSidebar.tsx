import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import {
  ArrowLeft,
  ShoppingBag,
  Package,
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
} from 'lucide-react-native';

export const SIDEBAR_WIDTH = 280;

const getCategoryIcon = (category: string): { Icon: any; color: string } => {
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
};

export interface CategoriesSidebarProps {
  categories: string[];
  /** Categoria selecionada (ex.: tela de categoria) — aplica estilo ativo */
  currentCategory?: string;
  /** Exibir item "Todos" no topo */
  showAllItem?: boolean;
  onAllPress?: () => void;
  /** Exibir item "Voltar do mercado" no final */
  showBackItem?: boolean;
  onBackPress?: () => void;
  onCategoryPress: (category: string) => void;
}

export const CategoriesSidebar: React.FC<CategoriesSidebarProps> = ({
  categories,
  currentCategory,
  showAllItem,
  onAllPress,
  showBackItem,
  onBackPress,
  onCategoryPress,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const hoverProps = (id: string) =>
    ({
      onMouseEnter: () => setHoveredCategory(id),
      onMouseLeave: () => setHoveredCategory(null),
    } as any);

  const content = (
    <>
      <Text style={styles.sidebarTitle}>Categorias</Text>

      {showAllItem && onAllPress && (
        <Pressable
          style={[styles.sidebarButton, hoveredCategory === '__todos__' && styles.sidebarButtonHovered]}
          onPress={onAllPress}
          {...hoverProps('__todos__')}
        >
          <View style={styles.sidebarButtonContent}>
            <View style={[styles.categoryIconContainer, { backgroundColor: '#2196F320' }]}>
              <ShoppingBag size={20} color="#2196F3" />
            </View>
            <Text style={[styles.sidebarButtonText, hoveredCategory === '__todos__' && styles.sidebarButtonTextHovered]}>
              Todos
            </Text>
          </View>
          <View style={[styles.categoryAccent, { backgroundColor: '#2196F3' }]} />
        </Pressable>
      )}

      {categories.map((cat) => {
        const { Icon, color } = getCategoryIcon(cat);
        const isActive = currentCategory === cat;
        return (
          <Pressable
            key={cat}
            style={[
              styles.sidebarButton,
              isActive && styles.sidebarButtonActive,
              hoveredCategory === cat && styles.sidebarButtonHovered,
            ]}
            onPress={() => onCategoryPress(cat)}
            {...hoverProps(cat)}
          >
            <View style={styles.sidebarButtonContent}>
              <View style={[styles.categoryIconContainer, { backgroundColor: `${color}20` }]}>
                <Icon size={20} color={color} />
              </View>
              <Text
                style={[
                  styles.sidebarButtonText,
                  isActive && styles.sidebarButtonTextActive,
                  hoveredCategory === cat && styles.sidebarButtonTextHovered,
                ]}
              >
                {cat}
              </Text>
            </View>
            <View style={[styles.categoryAccent, { backgroundColor: color }]} />
          </Pressable>
        );
      })}

      {showBackItem && onBackPress && (
        <Pressable
          style={[
            styles.sidebarButton,
            styles.sidebarBackButton,
            hoveredCategory === '__voltar__' && styles.sidebarButtonHovered,
          ]}
          onPress={onBackPress}
          {...hoverProps('__voltar__')}
        >
          <View style={styles.sidebarButtonContent}>
            <View style={[styles.categoryIconContainer, { backgroundColor: '#2196F320' }]}>
              <ArrowLeft size={20} color="#2196F3" />
            </View>
            <Text
              style={[
                styles.sidebarButtonText,
                hoveredCategory === '__voltar__' && styles.sidebarButtonTextHovered,
              ]}
            >
              Voltar do mercado
            </Text>
          </View>
          <View style={[styles.categoryAccent, { backgroundColor: '#2196F3' }]} />
        </Pressable>
      )}
    </>
  );

  return (
    <View style={styles.sidebar}>
      <ScrollView
        style={styles.sidebarScroll}
        contentContainerStyle={styles.sidebarScrollContent}
        showsVerticalScrollIndicator
      >
        {content}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: SIDEBAR_WIDTH,
    flexShrink: 0,
    backgroundColor: '#f8f9fa',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sidebarScroll: { flex: 1 },
  sidebarScrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 20,
    paddingHorizontal: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sidebarButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  sidebarButtonActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  sidebarButtonHovered: {
    backgroundColor: '#f5f5f5',
    borderColor: '#2196F3',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    transform: [{ translateX: 4 }],
  },
  sidebarBackButton: {
    marginTop: 32,
  },
  sidebarButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
  },
  sidebarButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    letterSpacing: 0.2,
    flex: 1,
  },
  sidebarButtonTextActive: {
    color: '#1976d2',
  },
  sidebarButtonTextHovered: {
    color: '#1976d2',
  },
});
