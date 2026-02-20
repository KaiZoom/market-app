import { useState, useMemo, useEffect, useRef } from 'react';
import { View, ScrollView, useWindowDimensions, Animated, Dimensions, Alert } from 'react-native';
import { ProductWithFinalPrice } from '../../../models';
import { useCart } from '../../../contexts/CartContext';

const RECOMMENDED_LIMIT = 6;
const MOBILE_BREAKPOINT = 768;
const ITEMS_PER_PAGE = 3;

export interface UseProductDetailModalDataProps {
  visible: boolean;
  product: ProductWithFinalPrice | null;
  marketProducts: ProductWithFinalPrice[];
  onClose: () => void;
  onSelectProduct?: (product: ProductWithFinalPrice) => void;
}

export function useProductDetailModalData({
  visible,
  product,
  marketProducts,
  onClose,
  onSelectProduct,
}: UseProductDetailModalDataProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [recommendedPage, setRecommendedPage] = useState(0);
  const zoomAnim = useRef(new Animated.Value(1)).current;
  const tx1 = useRef(new Animated.Value(0)).current;
  const ty1 = useRef(new Animated.Value(0)).current;
  const tx2 = useRef(new Animated.Value(0)).current;
  const ty2 = useRef(new Animated.Value(0)).current;
  const galleryRef = useRef<View>(null);
  const recommendedScrollRef = useRef<ScrollView | null>(null);
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < MOBILE_BREAKPOINT;
  const windowDimensions = isMobile
    ? { width: Dimensions.get('window').width, height: Dimensions.get('screen').height }
    : null;
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();

  const galleryWidth = Math.min(560, windowWidth - 48);
  const galleryHeight = 280;
  const centerX = galleryWidth / 2;
  const centerY = galleryHeight / 2;

  const productImages = useMemo(() => product?.images ?? [], [product?.images]);

  const handleImageHoverIn = () => {
    tx1.setValue(0);
    ty1.setValue(0);
    tx2.setValue(0);
    ty2.setValue(0);
    Animated.spring(zoomAnim, {
      toValue: 1.35,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handleImageHoverOut = () => {
    tx1.setValue(0);
    ty1.setValue(0);
    tx2.setValue(0);
    ty2.setValue(0);
    Animated.spring(zoomAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handleImageMouseMove = (e: any) => {
    const nativeEvent = e?.nativeEvent;
    if (!nativeEvent || !galleryRef.current) return;
    const rect = (galleryRef.current as any).getBoundingClientRect?.();
    if (!rect) return;
    const x = nativeEvent.clientX - rect.left;
    const y = nativeEvent.clientY - rect.top;
    const t1x = centerX - x;
    const t1y = centerY - y;
    const t2x = x - centerX;
    const t2y = y - centerY;
    tx1.setValue(t1x);
    ty1.setValue(t1y);
    tx2.setValue(t2x);
    ty2.setValue(t2y);
  };

  const recommended = useMemo(() => {
    if (!product || !marketProducts.length) return [];
    return marketProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, RECOMMENDED_LIMIT);
  }, [product, marketProducts]);

  const cartQuantity = useMemo(() => {
    if (!product) return 0;
    const item = items.find((i) => i.product.id === product.id);
    return item?.quantity ?? 0;
  }, [product?.id, items]);

  useEffect(() => {
    setImageIndex(0);
    zoomAnim.setValue(1);
    tx1.setValue(0);
    ty1.setValue(0);
    tx2.setValue(0);
    ty2.setValue(0);
  }, [product?.id]);

  const goToPrevImage = () => setImageIndex((i) => Math.max(0, i - 1));
  const goToNextImage = () =>
    setImageIndex((i) => Math.min(productImages.length - 1, i + 1));

  const totalRecommendedPages = Math.ceil(recommended.length / ITEMS_PER_PAGE);
  const canGoPrevRecommended = recommendedPage > 0;
  const canGoNextRecommended = recommendedPage < totalRecommendedPages - 1;

  const goToPrevRecommended = () => {
    if (!canGoPrevRecommended) return;
    const newPage = recommendedPage - 1;
    setRecommendedPage(newPage);
    const itemWidth = 132;
    recommendedScrollRef.current?.scrollTo({
      x: newPage * itemWidth * ITEMS_PER_PAGE,
      animated: true,
    });
  };

  const goToNextRecommended = () => {
    if (!canGoNextRecommended) return;
    const newPage = recommendedPage + 1;
    setRecommendedPage(newPage);
    const itemWidth = 132;
    recommendedScrollRef.current?.scrollTo({
      x: newPage * itemWidth * ITEMS_PER_PAGE,
      animated: true,
    });
  };

  const resetAndClose = () => onClose();

  const handleCartPlus = () => {
    if (!product) return;
    try {
      addToCart(product, 1);
    } catch (error: unknown) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível adicionar');
    }
  };

  const handleCartMinus = () => {
    if (!product || cartQuantity <= 0) return;
    if (cartQuantity === 1) {
      removeFromCart(product.id);
    } else {
      updateQuantity(product.id, cartQuantity - 1);
    }
  };

  const hasMultipleImages = productImages.length > 1;
  const canGoPrev = hasMultipleImages && imageIndex > 0;
  const canGoNext = hasMultipleImages && imageIndex < productImages.length - 1;

  return {
    imageIndex,
    zoomAnim,
    tx1,
    ty1,
    tx2,
    ty2,
    galleryRef,
    recommendedScrollRef,
    isMobile,
    windowDimensions,
    galleryWidth,
    galleryHeight,
    productImages,
    recommended,
    cartQuantity,
    handleImageHoverIn,
    handleImageHoverOut,
    handleImageMouseMove,
    goToPrevImage,
    goToNextImage,
    goToPrevRecommended,
    goToNextRecommended,
    resetAndClose,
    handleCartPlus,
    handleCartMinus,
    hasMultipleImages,
    canGoPrev,
    canGoNext,
    canGoPrevRecommended,
    canGoNextRecommended,
    ITEMS_PER_PAGE,
  };
}
