import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Pressable,
  ScrollView,
  Image,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { ProductWithFinalPrice, ProductImageSource } from '../models';
import { useCart } from '../contexts/CartContext';
import { getProductImageSource, DEFAULT_IMAGE_KEY } from '../utils/productImage';

const RECOMMENDED_LIMIT = 6;
const DEFAULT_IMAGE = require('../../assets/agua-sanitaria.png');

function toImageSource(src: ProductImageSource | undefined): { uri: string } | number {
  return getProductImageSource(src, DEFAULT_IMAGE);
}

interface ProductDetailModalProps {
  visible: boolean;
  product: ProductWithFinalPrice | null;
  marketProducts?: ProductWithFinalPrice[];
  onClose: () => void;
  onGoToCart: () => void;
  onSelectProduct?: (product: ProductWithFinalPrice) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  visible,
  product,
  marketProducts = [],
  onClose,
  onGoToCart,
  onSelectProduct,
}) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const zoomAnim = useRef(new Animated.Value(1)).current;
  const tx1 = useRef(new Animated.Value(0)).current;
  const ty1 = useRef(new Animated.Value(0)).current;
  const tx2 = useRef(new Animated.Value(0)).current;
  const ty2 = useRef(new Animated.Value(0)).current;
  const galleryRef = useRef<View>(null);
  const { width: windowWidth } = useWindowDimensions();
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();

  const galleryWidth = Math.min(560, windowWidth - 48);
  const galleryHeight = 280;
  const centerX = galleryWidth / 2;
  const centerY = galleryHeight / 2;

  const productImages = useMemo(() => product?.images ?? [], [product?.images]);

  const handleImageHoverIn = () => {
    setIsHoveringImage(true);
    setMousePos({ x: centerX, y: centerY });
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
    setIsHoveringImage(false);
    setMousePos(null);
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
    setMousePos({ x, y });
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
    setMousePos(null);
    setIsHoveringImage(false);
    zoomAnim.setValue(1);
    tx1.setValue(0);
    ty1.setValue(0);
    tx2.setValue(0);
    ty2.setValue(0);
  }, [product?.id]);

  const goToPrevImage = () => {
    setImageIndex((i) => Math.max(0, i - 1));
  };

  const goToNextImage = () => {
    setImageIndex((i) => Math.min(productImages.length - 1, i + 1));
  };

  const hasMultipleImages = productImages.length > 1;
  const canGoPrev = hasMultipleImages && imageIndex > 0;
  const canGoNext = hasMultipleImages && imageIndex < productImages.length - 1;

  const resetAndClose = () => {
    onClose();
  };

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

  const handleCartZero = () => {
    if (!product || cartQuantity <= 0) return;
    removeFromCart(product.id);
  };

  if (!product) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={resetAndClose}
    >
      <Pressable style={styles.overlay} onPress={resetAndClose}>
        <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
          <TouchableOpacity style={styles.closeButton} onPress={resetAndClose} hitSlop={12}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {productImages.length > 0 && (
              <View
                ref={galleryRef}
                style={[styles.galleryWrap, { width: galleryWidth, height: galleryHeight }]}
              >
                <Pressable
                  style={styles.galleryImageContainer}
                  onHoverIn={handleImageHoverIn}
                  onHoverOut={handleImageHoverOut}
                  {...({ onMouseMove: handleImageMouseMove } as any)}
                >
                  <Animated.Image
                    source={toImageSource(productImages[imageIndex])}
                    style={[
                      styles.galleryImage,
                      {
                        transform: [
                          { translateX: tx1 },
                          { translateY: ty1 },
                          { scale: zoomAnim },
                          { translateX: tx2 },
                          { translateY: ty2 },
                        ],
                      },
                    ]}
                    resizeMode="contain"
                  />
                </Pressable>
                {hasMultipleImages && (
                  <>
                    <TouchableOpacity
                      style={[styles.galleryArrow, styles.galleryArrowLeft]}
                      onPress={goToPrevImage}
                      disabled={!canGoPrev}
                    >
                      <Text style={[styles.galleryArrowText, !canGoPrev && styles.galleryArrowDisabled]}>‹</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.galleryArrow, styles.galleryArrowRight]}
                      onPress={goToNextImage}
                      disabled={!canGoNext}
                    >
                      <Text style={[styles.galleryArrowText, !canGoNext && styles.galleryArrowDisabled]}>›</Text>
                    </TouchableOpacity>
                    <View style={styles.galleryDots}>
                      {productImages.map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.galleryDot,
                            index === imageIndex && styles.galleryDotActive,
                          ]}
                        />
                      ))}
                    </View>
                  </>
                )}
              </View>
            )}
            <View style={styles.content}>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.category}>{product.category}</Text>

              <View style={styles.descriptionBlock}>
                <Text style={styles.descriptionLabel}>Descrição</Text>
                <Text style={styles.description}>{product.description}</Text>
              </View>

              <View style={styles.priceContainer}>
                {product.discount > 0 && (
                  <>
                    <Text style={styles.originalPrice}>R$ {product.price.toFixed(2)}</Text>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{product.discount}% OFF</Text>
                    </View>
                  </>
                )}
                <Text style={styles.price}>R$ {product.finalPrice.toFixed(2)}</Text>
              </View>

              <View style={styles.cartQuantityRow}>
                <Text style={styles.cartQuantityLabel}>No carrinho:</Text>
                <View style={styles.cartQuantityControl}>
                  <TouchableOpacity
                    style={[styles.cartQuantityBtn, styles.cartQuantityBtnZero]}
                    onPress={handleCartZero}
                    disabled={cartQuantity === 0}
                  >
                    <Text style={styles.cartQuantityBtnText}>🗑</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cartQuantityBtn}
                    onPress={handleCartMinus}
                    disabled={cartQuantity === 0}
                  >
                    <Text style={styles.cartQuantityBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.cartQuantityValue}>{cartQuantity}</Text>
                  <TouchableOpacity
                    style={styles.cartQuantityBtn}
                    onPress={handleCartPlus}
                    disabled={cartQuantity >= product.stock}
                  >
                    <Text style={styles.cartQuantityBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {recommended.length > 0 && (
              <View style={styles.recommendedSection}>
                <Text style={styles.recommendedTitle}>Recomendados</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recommendedList}
                >
                  {recommended.map((rec) => (
                    <TouchableOpacity
                      key={rec.id}
                      style={styles.recommendedCard}
                      onPress={() => onSelectProduct?.(rec)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.recommendedImageWrap}>
                        <Image
                          source={toImageSource(rec.images?.[0])}
                          style={styles.recommendedImage}
                          resizeMode="cover"
                        />
                      </View>
                      <Text style={styles.recommendedName} numberOfLines={2}>
                        {rec.name}
                      </Text>
                      <Text style={styles.recommendedPrice}>
                        R$ {rec.finalPrice.toFixed(2)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxWidth: 560,
    width: '100%',
    maxHeight: '90%',
  },
  scrollView: {
    maxHeight: '100%',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  galleryWrap: {
    alignSelf: 'center',
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: 'relative',
  },
  galleryImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryArrow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  galleryArrowLeft: {
    left: 0,
    borderTopLeftRadius: 16,
  },
  galleryArrowRight: {
    right: 0,
    borderTopRightRadius: 16,
  },
  galleryArrowText: {
    fontSize: 36,
    color: '#fff',
    fontWeight: '300',
  },
  galleryArrowDisabled: {
    opacity: 0.35,
  },
  galleryDots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  galleryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
    marginHorizontal: 4,
  },
  galleryDotActive: {
    backgroundColor: '#fff',
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 1,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 26,
    color: '#666',
    lineHeight: 30,
  },
  content: {
    padding: 28,
    paddingTop: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  category: {
    fontSize: 15,
    color: '#666',
    marginBottom: 16,
  },
  descriptionBlock: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#eee',
  },
  descriptionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 12,
  },
  discountBadge: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cartQuantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  cartQuantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cartQuantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartQuantityBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  cartQuantityBtnZero: {
    backgroundColor: '#757575',
    marginLeft: 0,
  },
  cartQuantityBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  cartQuantityValue: {
    minWidth: 44,
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginLeft: 8,
  },
  recommendedSection: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  recommendedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 14,
  },
  recommendedList: {
    paddingRight: 28,
  },
  recommendedCard: {
    width: 120,
    marginRight: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  recommendedImageWrap: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  recommendedImage: {
    width: '100%',
    height: '100%',
  },
  recommendedName: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  recommendedPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
  },
});
