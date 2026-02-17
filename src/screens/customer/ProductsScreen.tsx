import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  useWindowDimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { ProductWithFinalPrice } from '../../models';
import { productService } from '../../services';
import { useCart } from '../../contexts/CartContext';
import { ProductDetailModal } from '../../components/ProductDetailModal';
import { getProductImageSource } from '../../utils/productImage';

const DEFAULT_PRODUCT_IMAGE = require('../../../assets/agua-sanitaria.png');

const MOBILE_BREAKPOINT = 768;
const ITEMS_PER_VIEW_MOBILE = 3;
const ITEMS_PER_VIEW_WEB = 8;
const PADDING_HORIZONTAL = 16;
const GAP = 8;
const WEB_LAYOUT_BUFFER = 48;
const PEEK_WIDTH = 28;

interface Props {
  route: any;
  navigation: any;
}

interface Section {
  title: string;
  items: ProductWithFinalPrice[];
}

interface CartButtonsOverlayProps {
  product: ProductWithFinalPrice;
  cartQty: number;
  onQuickAdd: () => void;
  onQuantityChange: (newQty: number, e?: any) => void;
}

const CartButtonsOverlay: React.FC<CartButtonsOverlayProps> = ({
  product,
  cartQty,
  onQuickAdd,
  onQuantityChange,
}) => {
  const inCart = cartQty > 0;

  if (!inCart) {
    return (
      <Pressable
        style={(state: { pressed: boolean; hovered?: boolean }) => [
          styles.quickAddButtonOverlay,
          state.hovered && styles.quickAddButtonOverlayHover,
        ]}
        onPress={(e) => {
          e?.stopPropagation?.();
          onQuickAdd();
        }}
      >
        <Text style={styles.quickAddButtonText}>+</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.quantityControlOverlay}>
      <View style={styles.quantityControlWrap}>
        <TouchableOpacity
          style={styles.quantityControlButton}
          onPress={(e) => onQuantityChange(cartQty - 1, e)}
        >
          <Text style={styles.quantityControlSymbol}>−</Text>
        </TouchableOpacity>
        <Text style={styles.quantityControlValue}>{cartQty}</Text>
        <TouchableOpacity
          style={styles.quantityControlButton}
          onPress={(e) => onQuantityChange(cartQty + 1, e)}
          disabled={cartQty >= product.stock}
        >
          <Text style={[styles.quantityControlSymbol, cartQty >= product.stock && styles.quantityControlSymbolDisabled]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const ProductsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { marketId, marketName } = route.params;
  const [products, setProducts] = useState<ProductWithFinalPrice[]>([]);
  const [searchText, setSearchText] = useState('');
  const { getTotalItems, addToCart, openCartModal, items, updateQuantity } = useCart();
  const { width } = useWindowDimensions();

  const isMobile = width < MOBILE_BREAKPOINT;
  const [categoryPage, setCategoryPage] = useState<Record<string, number>>({});
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithFinalPrice | null>(null);
  const categoryScrollRefs = useRef<Record<string, ScrollView | null>>({});

  const itemsPerView = isMobile ? ITEMS_PER_VIEW_MOBILE : ITEMS_PER_VIEW_WEB;

  const itemSize = useMemo(() => {
    const n = itemsPerView;
    if (isMobile) {
      const availableWidth = width - PADDING_HORIZONTAL * 2 - GAP;
      return Math.max(80, Math.floor(availableWidth / n));
    }
    const totalGap = GAP * (n - 1);
    const extraBuffer = WEB_LAYOUT_BUFFER;
    const sidebarWidth = 200;
    const arrowSpace = 80;
    const availableWidth = width - PADDING_HORIZONTAL * 2 - totalGap - extraBuffer - sidebarWidth - arrowSpace;
    return Math.max(60, Math.floor(availableWidth / n));
  }, [width, isMobile, itemsPerView]);

  const pageWidth = itemsPerView * itemSize + (itemsPerView - 1) * GAP;
  const carouselVisibleWidth = isMobile ? width - PADDING_HORIZONTAL * 2 : pageWidth + PEEK_WIDTH;

  useEffect(() => {
    const data = productService.getProductsByMarket(marketId);
    setProducts(data);
  }, [marketId]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View style={styles.headerLeftContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.headerBackText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitleText} numberOfLines={1}>{marketName}</Text>
        </View>
      ),
      headerTitleAlign: 'center',
      headerTitleContainerStyle: { flex: 1, left: 0, right: 0 },
      headerTitle: () => (
        <View style={styles.headerSearchContainer}>
          <TextInput
            style={styles.headerSearchInput}
            placeholder="Buscar produtos..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#888"
          />
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerCartButton}
          onPress={() => openCartModal(navigation)}
        >
          <Text style={styles.cartButtonText}>Carrinho ({getTotalItems()})</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, marketName, searchText, getTotalItems]);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products],
  );

  const sections = useMemo((): Section[] => {
    const query = searchText.trim().toLowerCase();
    const filtered = query
      ? products.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query),
        )
      : products;

    const byCategory = filtered.reduce<Record<string, ProductWithFinalPrice[]>>(
      (acc, product) => {
        const cat = product.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(product);
        return acc;
      },
      {},
    );

    return Object.entries(byCategory).map(([title, items]) => ({
      title,
      items,
    }));
  }, [products, searchText]);

  const handlePressCard = (product: ProductWithFinalPrice) => {
    if (product.stock === 0) {
      Alert.alert('Estoque Esgotado', 'Este produto não está disponível no momento.');
      return;
    }
    setSelectedProduct(product);
  };

  const handleQuickAdd = (product: ProductWithFinalPrice) => {
    if (product.stock === 0) {
      Alert.alert('Estoque Esgotado', 'Este produto não está disponível no momento.');
      return;
    }
    try {
      addToCart(product, 1);
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  const handleQuantityChange = (product: ProductWithFinalPrice, newQty: number, e?: any) => {
    e?.stopPropagation?.();
    try {
      updateQuantity(product.id, newQty);
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  const goToCategory = (category: string) => {
    navigation.navigate('CategoryProducts', { marketId, marketName, category });
  };

  const goToPrevPage = (categoryTitle: string) => {
    const currentPage = categoryPage[categoryTitle] ?? 0;
    const newPage = Math.max(0, currentPage - 1);
    const scrollRef = categoryScrollRefs.current[categoryTitle];
    scrollRef?.scrollTo({ x: newPage * pageWidth, animated: true });
    setCategoryPage((prev) => ({ ...prev, [categoryTitle]: newPage }));
  };

  const goToNextPage = (categoryTitle: string, totalItems: number) => {
    const currentPage = categoryPage[categoryTitle] ?? 0;
    const maxPage = Math.ceil(totalItems / itemsPerView) - 1;
    const newPage = Math.min(maxPage, currentPage + 1);
    const scrollRef = categoryScrollRefs.current[categoryTitle];
    scrollRef?.scrollTo({ x: newPage * pageWidth, animated: true });
    setCategoryPage((prev) => ({ ...prev, [categoryTitle]: newPage }));
  };

  const handleCategoryScroll = (categoryTitle: string) => (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const page = Math.round(x / pageWidth);
    setCategoryPage((prev) => {
      if ((prev[categoryTitle] ?? 0) === page) return prev;
      return { ...prev, [categoryTitle]: page };
    });
  };

  const imageSize = itemSize - 24;
  const cardMinHeight = imageSize + 64;

  const renderProductCard = (product: ProductWithFinalPrice) => {
    const cartQty = items.find((i) => i.product.id === product.id)?.quantity ?? 0;
    const inCart = cartQty > 0;

    return (
      <View
        key={product.id}
        style={[
          styles.productCard,
          { width: itemSize, minHeight: cardMinHeight },
          hoveredCardId === product.id && styles.productCardHover,
        ]}
        {...({
          onMouseEnter: () => setHoveredCardId(product.id),
          onMouseLeave: (e: any) => {
            const related = e?.nativeEvent?.relatedTarget;
            const current = e?.currentTarget;
            if (current && related && current.contains(related)) return;
            setHoveredCardId(null);
          },
        } as any)}
      >
        <TouchableOpacity
          style={styles.productCardTouchable}
          onPress={() => handlePressCard(product)}
          activeOpacity={0.8}
        >
          <View style={[styles.imageWrapper, { width: imageSize, height: imageSize }]}>
            <Image
              source={getProductImageSource(product.images?.[0], DEFAULT_PRODUCT_IMAGE)}
              style={[styles.productImage, { width: imageSize, height: imageSize }]}
              resizeMode="cover"
            />
            <CartButtonsOverlay
              product={product}
              cartQty={cartQty}
              onQuickAdd={() => handleQuickAdd(product)}
              onQuantityChange={(newQty, e) => handleQuantityChange(product, newQty, e)}
            />
          </View>
          <View style={styles.originalPriceRow}>
            {product.discount > 0 && (
              <>
                <Text style={styles.originalPrice}>R$ {product.price.toFixed(2)} un</Text>
                <Text style={styles.discountPercent}> -{product.discount}%</Text>
              </>
            )}
          </View>
          <Text style={isMobile ? styles.productPriceMobile : styles.productPrice}>
            R$ {product.finalPrice.toFixed(2)} un
          </Text>
          <View style={styles.productNameSlot}>
            <Text
              style={isMobile ? styles.productNameMobile : styles.productName}
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {product.name}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCategoryBlock = (section: Section) => {
    const page = categoryPage[section.title] ?? 0;
    const totalPages = Math.ceil(section.items.length / itemsPerView);
    const canGoPrev = !isMobile && page > 0;
    const canGoNext = !isMobile && page < totalPages - 1;
    return (
      <View key={section.title} style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>{section.title}</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => goToCategory(section.title)}
          >
            <Text style={styles.seeAllText}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.carouselRow}>
          {!isMobile && (
            <TouchableOpacity
              style={[styles.arrowButton, !canGoPrev && styles.arrowDisabled]}
              onPress={() => canGoPrev && goToPrevPage(section.title)}
              disabled={!canGoPrev}
            >
              <Text style={[styles.arrowText, !canGoPrev && styles.arrowTextDisabled]}>‹</Text>
            </TouchableOpacity>
          )}
          <View style={[styles.carouselViewport, { width: carouselVisibleWidth }]}>
            <ScrollView
              ref={(el) => {
                categoryScrollRefs.current[section.title] = el;
              }}
              horizontal
              showsHorizontalScrollIndicator={isMobile}
              decelerationRate="fast"
              snapToInterval={isMobile ? undefined : pageWidth}
              snapToAlignment="start"
              contentContainerStyle={styles.carouselContent}
              onMomentumScrollEnd={!isMobile ? handleCategoryScroll(section.title) : undefined}
            >
              {section.items.map((p) => (
                <View key={p.id} style={[styles.carouselCardWrap, { width: itemSize, marginRight: GAP }]}>
                  {renderProductCard(p)}
                </View>
              ))}
            </ScrollView>
          </View>
          {!isMobile && (
            <TouchableOpacity
              style={[styles.arrowButton, !canGoNext && styles.arrowDisabled]}
              onPress={() => canGoNext && goToNextPage(section.title, section.items.length)}
              disabled={!canGoNext}
            >
              <Text style={[styles.arrowText, !canGoNext && styles.arrowTextDisabled]}>›</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const mainContent = (
    <>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={true}
      >
        {sections.map(renderCategoryBlock)}
      </ScrollView>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {isMobile ? (
        <View style={styles.mobileWrapper}>
          <View style={styles.categoryStrip}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryStripContent}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={styles.categoryCircle}
                  onPress={() => goToCategory(cat)}
                >
                  <Text style={styles.categoryCircleText} numberOfLines={1}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.mobileContent}>{mainContent}</View>
        </View>
      ) : (
        <View style={styles.webRow}>
          <View style={styles.sidebar}>
            <Text style={styles.sidebarTitle}>Categorias</Text>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.sidebarButton}
                onPress={() => goToCategory(cat)}
              >
                <Text style={styles.sidebarButtonText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.mainContent}>{mainContent}</View>
        </View>
      )}
      <ProductDetailModal
        visible={!!selectedProduct}
        product={selectedProduct}
        marketProducts={products}
        onClose={() => setSelectedProduct(null)}
        onGoToCart={() => openCartModal(navigation)}
        onSelectProduct={setSelectedProduct}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerBackText: {
    fontSize: 24,
    marginRight: 12,
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    maxWidth: 140,
  },
  headerSearchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    minWidth: 0,
  },
  headerSearchInput: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  headerCartButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 16,
  },
  cartButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  categoryStrip: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryStripContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryCircleText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1976d2',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  webRow: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 200,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#eee',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  sidebarTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sidebarButton: {
    backgroundColor: '#e3f2fd',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  sidebarButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1976d2',
  },
  mainContent: {
    flex: 1,
  },
  mobileWrapper: {
    flex: 1,
  },
  mobileContent: {
    flex: 1,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 12,
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  list: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 32,
  },
  scrollView: {
    flex: 1,
  },
  sectionBlock: {
    marginBottom: 28,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  carouselRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowButton: {
    width: 40,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  arrowDisabled: {
    backgroundColor: '#f5f5f5',
  },
  arrowText: {
    fontSize: 32,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  arrowTextDisabled: {
    color: '#ccc',
  },
  carouselViewport: {
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  carouselContent: {
    flexDirection: 'row',
    paddingRight: PEEK_WIDTH,
  },
  carouselCardWrap: {
  },
  productCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  productCardHover: {
    borderColor: '#555',
  },
  productCardTouchable: {
    flex: 1,
    minWidth: 0,
  },
  imageWrapper: {
    position: 'relative',
  },
  productImage: {
    borderRadius: 6,
    marginBottom: 6,
  },
  quantityControlOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
  },
  quantityControlWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#364661',
    borderRadius: 18,
    overflow: 'hidden',
  },
  quantityControlButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityControlSymbol: {
    fontFamily: 'BricolageGrotesque_700Bold',
    color: '#fff',
    fontSize: 16,
  },
  quantityControlSymbolDisabled: {
    opacity: 0.4,
  },
  quantityControlValue: {
    fontFamily: 'BricolageGrotesque_700Bold',
    color: '#fff',
    fontSize: 13,
    minWidth: 24,
    textAlign: 'center',
  },
  originalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    minHeight: 18,
    marginBottom: 2,
  },
  originalPrice: {
    fontFamily: 'BricolageGrotesque_400Regular',
    fontSize: 11,
    color: '#888',
    textDecorationLine: 'line-through',
  },
  discountPercent: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 11,
    color: '#000',
    backgroundColor: '#d9e7f2',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#b8d4e8',
    marginLeft: 8,
  },
  productPrice: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 14,
    color: '#000',
    marginBottom: 2,
  },
  productPriceMobile: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 15,
    color: '#000',
    marginBottom: 2,
  },
  productNameSlot: {
    minHeight: 36,
    justifyContent: 'center',
    overflow: 'hidden',
    minWidth: 0,
  },
  productName: {
    fontFamily: 'BricolageGrotesque_400Regular',
    fontSize: 12,
    color: '#333',
  },
  productNameMobile: {
    fontFamily: 'BricolageGrotesque_400Regular',
    fontSize: 13,
    color: '#333',
  },
  quickAddButtonOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#364661',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAddButtonOverlayHover: {
    backgroundColor: '#4a5d7a',
  },
  quickAddButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#364661',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAddButtonText: {
    fontFamily: 'BricolageGrotesque_700Bold',
    color: '#fff',
    fontSize: 18,
    lineHeight: 20,
  },
  emptyCard: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
});
