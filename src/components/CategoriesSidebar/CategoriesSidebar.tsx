import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { ArrowLeft, ShoppingBag } from 'lucide-react-native';
import { useCategoriesSidebar, getCategoryIcon } from './hooks/useCategoriesSidebar';

export const SIDEBAR_WIDTH = 280;

export interface CategoriesSidebarProps {
  categories: string[];
  currentCategory?: string;
  showAllItem?: boolean;
  onAllPress?: () => void;
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
  const { hoveredCategory, hoverProps } = useCategoriesSidebar();

  const content = (
    <>
      <Text style={styles.sidebarTitle}>Categorias</Text>

      {showAllItem && onAllPress && (
        <Pressable
          style={[styles.sidebarButton, hoveredCategory === '__todos__' && styles.sidebarButtonHovered]}
          onPress={onAllPress}
          {...(hoverProps('__todos__') as any)}
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
            {...(hoverProps(cat) as any)}
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
          {...(hoverProps('__voltar__') as any)}
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
