import { useEffect, useRef, useMemo } from 'react';
import { Alert, Animated, useWindowDimensions } from 'react-native';
import { useCart } from '../../../contexts/CartContext';
import type { CartItem } from '../../../contexts/CartContext';

const PANEL_WIDTH_MAX = 420;
const PANEL_WIDTH_PERCENT = 0.9;
const MOBILE_BREAKPOINT = 768;

export interface CartSection {
  title: string;
  data: CartItem[];
}

export function useCartModal() {
  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_BREAKPOINT;
  const panelWidth = isMobile ? width : Math.min(PANEL_WIDTH_MAX, width * PANEL_WIDTH_PERCENT);
  const slideAnim = useRef(new Animated.Value(panelWidth)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const {
    items,
    removeFromCart,
    updateQuantity,
    getTotalAmount,
    selectedMarketId,
    cartModalVisible,
    closeCartModal,
    closeCartModalAndGoToCheckout,
  } = useCart();

  useEffect(() => {
    const w = isMobile ? width : Math.min(PANEL_WIDTH_MAX, width * PANEL_WIDTH_PERCENT);
    if (cartModalVisible) {
      slideAnim.setValue(w);
      overlayOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: w,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [cartModalVisible, width, isMobile, slideAnim, overlayOpacity]);

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Carrinho vazio', 'Adicione produtos ao carrinho antes de finalizar.');
      return;
    }
    if (!selectedMarketId) {
      Alert.alert('Erro', 'Selecione um mercado antes de finalizar.');
      return;
    }
    closeCartModalAndGoToCheckout();
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    try {
      updateQuantity(productId, newQuantity);
    } catch (error: unknown) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Erro');
    }
  };

  const sections = useMemo((): CartSection[] => {
    const byCategory = items.reduce<Record<string, CartItem[]>>((acc, item) => {
      const cat = item.product.category || 'Outros';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
    return Object.entries(byCategory)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, data]) => ({ title, data }));
  }, [items]);

  return {
    items,
    removeFromCart,
    getTotalAmount,
    cartModalVisible,
    closeCartModal,
    handleCheckout,
    handleUpdateQuantity,
    sections,
    panelWidth,
    slideAnim,
    overlayOpacity,
    isMobile,
  };
}
