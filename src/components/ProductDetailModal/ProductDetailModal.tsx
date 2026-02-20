import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Image,
  Animated,
} from 'react-native';
import { ChevronRight, ChevronLeft, ShoppingCart, Plus, Minus } from 'lucide-react-native';
import { ProductWithFinalPrice, ProductImageSource } from '../../models';
import { getProductImageSource } from '../../utils/productImage';
import { useProductDetailModalData } from './hooks/useProductDetailModalData';

const DEFAULT_IMAGE = require('../../../assets/agua-sanitaria.png');

function toImageSource(src: ProductImageSource | undefined): { uri: string } | number {
  return getProductImageSource(src, DEFAULT_IMAGE);
}

export interface ProductDetailModalProps {
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
  const data = useProductDetailModalData({
    visible,
    product,
    marketProducts,
    onClose,
    onSelectProduct,
  });

  const {
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
  } = data;

  if (!product) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={resetAndClose}
    >
      <Pressable
        style={[
          styles.overlay,
          isMobile && windowDimensions && [
            styles.overlayFullScreen,
            { width: windowDimensions.width, height: windowDimensions.height, minHeight: windowDimensions.height },
          ],
        ]}
        onPress={resetAndClose}
      >
        <View
          style={[
            styles.modalBox,
            isMobile &&
              windowDimensions && [
                styles.modalBoxFullScreen,
                {
                  width: windowDimensions.width,
                  height: windowDimensions.height,
                  minHeight: windowDimensions.height,
                },
              ],
          ]}
          onStartShouldSetResponder={() => true}
          {...({ onClick: (e: any) => e?.stopPropagation?.() } as any)}
        >
          <TouchableOpacity style={styles.closeButton} onPress={resetAndClose} hitSlop={12}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>

          <ScrollView
            style={[styles.scrollView, isMobile && styles.scrollViewFullScreen]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {productImages.length > 0 && (
              <View
                ref={galleryRef}
                style={[styles.galleryWrap, { width: galleryWidth, height: galleryHeight }]}
              >
                <View
                  style={styles.galleryImageContainer}
                  {...({
                    onMouseEnter: handleImageHoverIn,
                    onMouseLeave: handleImageHoverOut,
                    onMouseMove: handleImageMouseMove,
                  } as any)}
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
                </View>
                {hasMultipleImages && (
                  <>
                    <TouchableOpacity
                      style={[styles.galleryArrow, styles.galleryArrowLeft]}
                      onPress={goToPrevImage}
                      disabled={!canGoPrev}
                    >
                      <ChevronLeft size={24} color={canGoPrev ? '#fff' : '#888'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.galleryArrow, styles.galleryArrowRight]}
                      onPress={goToNextImage}
                      disabled={!canGoNext}
                    >
                      <ChevronRight size={24} color={canGoNext ? '#fff' : '#888'} />
                    </TouchableOpacity>
                    <View style={styles.galleryDots}>
                      {productImages.map((_, i) => (
                        <View
                          key={i}
                          style={[styles.galleryDot, i === imageIndex && styles.galleryDotActive]}
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
                  <View style={styles.originalPriceRow}>
                    <Text style={styles.originalPrice}>R$ {product.price.toFixed(2)} un</Text>
                    <Text style={styles.discountPercent}> -{product.discount}%</Text>
                  </View>
                )}
                <View style={styles.priceAndCartRow}>
                  <Text style={styles.price}>R$ {product.finalPrice.toFixed(2)} un</Text>
                  {cartQuantity === 0 ? (
                    <TouchableOpacity
                      style={[styles.modalAddToCartButton, product.stock === 0 && styles.modalAddToCartButtonDisabled]}
                      onPress={handleCartPlus}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart size={18} color="#fff" />
                      <Text style={styles.modalAddToCartButtonText}>Adicionar ao carrinho</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.modalQuantityBar}>
                      <TouchableOpacity style={styles.modalQuantityBtn} onPress={handleCartMinus}>
                        <Minus size={18} color="#fff" />
                      </TouchableOpacity>
                      <Text style={styles.modalQuantityValue}>{cartQuantity}</Text>
                      <TouchableOpacity
                        style={styles.modalQuantityBtn}
                        onPress={handleCartPlus}
                        disabled={cartQuantity >= product.stock}
                      >
                        <Plus size={18} color={cartQuantity >= product.stock ? '#888' : '#fff'} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {recommended.length > 0 && (
              <View style={styles.recommendedSection}>
                <View style={styles.recommendedHeader}>
                  <Text style={styles.recommendedTitle}>Recomendados</Text>
                  {!isMobile && recommended.length > ITEMS_PER_PAGE && (
                    <View style={styles.recommendedNav}>
                      <TouchableOpacity
                        style={[styles.navArrowButton, !canGoPrevRecommended && styles.navArrowButtonDisabled]}
                        onPress={goToPrevRecommended}
                        disabled={!canGoPrevRecommended}
                      >
                        <ChevronLeft size={18} color={canGoPrevRecommended ? '#333' : '#ccc'} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.navArrowButton, !canGoNextRecommended && styles.navArrowButtonDisabled]}
                        onPress={goToNextRecommended}
                        disabled={!canGoNextRecommended}
                      >
                        <ChevronRight size={18} color={canGoNextRecommended ? '#333' : '#ccc'} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                <ScrollView
                  ref={recommendedScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={isMobile}
                  contentContainerStyle={styles.recommendedList}
                  scrollEnabled={isMobile}
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
                      <Text style={styles.recommendedPrice}>R$ {rec.finalPrice.toFixed(2)}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>
        </View>
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
  overlayFullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 0,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxWidth: 560,
    width: '100%',
    maxHeight: '90%',
    cursor: 'default',
  },
  modalBoxFullScreen: {
    borderRadius: 0,
  },
  scrollView: {
    maxHeight: '100%',
  },
  scrollViewFullScreen: {
    flex: 1,
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
    marginBottom: 16,
  },
  priceAndCartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  originalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    minHeight: 22,
    marginBottom: 2,
  },
  originalPrice: {
    fontSize: 16,
    color: '#888',
    textDecorationLine: 'line-through',
  },
  discountPercent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    backgroundColor: '#d9e7f2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#b8d4e8',
    marginLeft: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 12,
  },
  modalAddToCartButton: {
    backgroundColor: '#364661',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    flexDirection: 'row',
    gap: 8,
  },
  modalAddToCartButtonDisabled: {
    opacity: 0.5,
  },
  modalAddToCartButtonText: {
    fontFamily: 'BricolageGrotesque_700Bold',
    color: '#fff',
    fontSize: 14,
  },
  modalQuantityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#364661',
    borderRadius: 20,
    overflow: 'hidden',
    flexShrink: 0,
  },
  modalQuantityBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalQuantityValue: {
    fontFamily: 'BricolageGrotesque_700Bold',
    color: '#fff',
    fontSize: 16,
    minWidth: 28,
    textAlign: 'center',
  },
  recommendedSection: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  recommendedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  recommendedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  recommendedNav: {
    flexDirection: 'row',
    gap: 8,
  },
  navArrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  navArrowButtonDisabled: {
    opacity: 0.4,
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
