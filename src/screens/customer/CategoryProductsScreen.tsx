import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Image,
  SectionList,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Alert,
  useWindowDimensions,
  ScrollView,
  TextInput,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { ArrowLeft, Plus, Minus, ShoppingCart, ChevronLeft, ChevronRight, ChevronDown, Search, ShoppingBag, User, Utensils, GlassWater, Sparkles, ShowerHead, Croissant, Drumstick, Apple, Sandwich, Milk, Package } from 'lucide-react-native';
import { ProductWithFinalPrice } from '../../models';
import { productService } from '../../services';
import { useCart } from '../../contexts/CartContext';
import { ProductDetailModal } from '../../components/ProductDetailModal';
import { getProductImageSource } from '../../utils/productImage';

const DEFAULT_PRODUCT_IMAGE = require('../../../assets/agua-sanitaria.png');

const MOBILE_BREAKPOINT = 768;
const ITEMS_PER_ROW_WEB = 8;
const ITEMS_PER_ROW_MOBILE = 8;
const PADDING_HORIZONTAL = 16;
const GAP = 8;
const WEB_LAYOUT_BUFFER = 48;

interface Props {
  route: any;
  navigation: any;
}

interface Section {
  title: string;
  data: ProductWithFinalPrice[][];
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

const getCategoryIcon = (cat: string) => {
  const iconMap: Record<string, { Icon: any; color: string }> = {
    'Alimentos': { Icon: Utensils, color: '#FF9800' },
    'Bebidas': { Icon: GlassWater, color: '#2196F3' },
    'Limpeza': { Icon: Sparkles, color: '#00BCD4' },
    'Higiene': { Icon: ShowerHead, color: '#9C27B0' },
    'Padaria': { Icon: Croissant, color: '#FFC107' },
    'Açougue': { Icon: Drumstick, color: '#F44336' },
    'Hortifruti': { Icon: Apple, color: '#4CAF50' },
    'Frios': { Icon: Sandwich, color: '#FFEB3B' },
    'Laticínios': { Icon: Milk, color: '#E0E0E0' },
    'Mercearia': { Icon: ShoppingBag, color: '#795548' },
  };
  return iconMap[cat] || { Icon: Package, color: '#757575' };
};

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
        <Plus size={18} color="#fff" />
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
          <Minus size={16} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.quantityControlValue}>{cartQty}</Text>
        <TouchableOpacity
          style={styles.quantityControlButton}
          onPress={(e) => onQuantityChange(cartQty + 1, e)}
          disabled={cartQty >= product.stock}
        >
          <Plus size={16} color={cartQty >= product.stock ? "#888" : "#fff"} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SearchBar: React.FC<{ searchText: string; onChangeText: (text: string) => void; placeholder?: string }> = ({ searchText, onChangeText, placeholder = 'Buscar produtos...' }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={styles.headerSearchWrapper}>
      <View style={[styles.headerSearchContainer, isFocused && styles.headerSearchContainerFocused]}>
        <Search size={18} color={isFocused ? "#2196F3" : "#888"} style={[styles.searchIcon, { outlineStyle: 'none', outlineWidth: 0 } as any]} />
        <TextInput
          style={[styles.headerSearchInput, { outlineStyle: 'none', outlineWidth: 0, outlineColor: 'transparent' } as any]}
          placeholder={placeholder}
          value={searchText}
          onChangeText={onChangeText}
          placeholderTextColor="#888"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCorrect={false}
          autoCapitalize="none"
          selectionColor="#2196F3"
          editable={true}
        />
      </View>
    </View>
  );
};

export const CategoryProductsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { marketId, marketName, category } = route.params;
  const [products, setProducts] = useState<ProductWithFinalPrice[]>([]);
  const [searchText, setSearchText] = useState('');
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithFinalPrice | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const { getTotalItems, addToCart, openCartModal, items, updateQuantity } = useCart();
  const { width } = useWindowDimensions();
  const bannerScrollRef = useRef<ScrollView | null>(null);

  const banners = [
    { id: 1, color: '#2196F3' }, // Azul
    { id: 2, color: '#F44336' }, // Vermelho
    { id: 3, color: '#4CAF50' }, // Verde
    { id: 4, color: '#FF9800' }, // Laranja
  ];

  const isMobile = width < MOBILE_BREAKPOINT;
  const itemsPerRow = isMobile ? ITEMS_PER_ROW_MOBILE : ITEMS_PER_ROW_WEB;

  const itemSize = useMemo(() => {
    const n = itemsPerRow;
    const totalGap = GAP * (n - 1);
    const padding = 32; // Padding lateral adequado
    const availableWidth = width - padding * 2 - totalGap;
    return Math.floor(availableWidth / n);
  }, [width, itemsPerRow]);

  useEffect(() => {
    const data = productService.getProductsByMarket(marketId);
    setProducts(data);
  }, [marketId]);

  const bannerWidth = useMemo(() => {
    return width;
  }, [width]);

  const handleBannerScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / bannerWidth);
    setBannerIndex(newIndex);
  };

  const goToBanner = (index: number) => {
    setBannerIndex(index);
    bannerScrollRef.current?.scrollTo({
      x: index * bannerWidth,
      animated: true,
    });
  };

  // Auto-play do banner a cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => {
        const next = (prev + 1) % banners.length;
        bannerScrollRef.current?.scrollTo({
          x: next * bannerWidth,
          animated: true,
        });
        return next;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [bannerWidth, banners.length]);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products],
  );

  const goToCategory = (cat: string) => {
    navigation.navigate('CategoryProducts', { marketId, marketName, category: cat });
  };

  const goToAllProducts = () => {
    navigation.navigate('Products', { marketId, marketName });
  };

  useEffect(() => {
    navigation.setOptions(
      isMobile
        ? {
            headerStyle: { minHeight: 200 },
            header: () => (
              <View style={styles.mobileHeaderRoot}>
                <View style={styles.mobileHeaderRow1}>
                  <TouchableOpacity
                    style={styles.mobileBackBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <ArrowLeft size={22} color="#2196F3" />
                  </TouchableOpacity>
                  <View style={styles.mobileLogoSmall}>
                    <ShoppingBag size={22} color="#2196F3" strokeWidth={2.5} />
                    <Text style={styles.mobileLogoText}>MARKET</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.mobileLojaSelector}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.mobileLojaLabel}>Loja de</Text>
                    <View style={styles.mobileLojaRow}>
                      <Text style={styles.mobileLojaName} numberOfLines={1}>{marketName} · {category}</Text>
                      <ChevronDown size={16} color="#333" />
                    </View>
                  </TouchableOpacity>
                  <View style={styles.mobileHeaderIcons}>
                    <Pressable
                      style={(s: { pressed: boolean }) => [styles.mobileIconBtn, s.pressed && styles.mobileIconBtnPressed]}
                      onPress={() => {}}
                    >
                      <User size={22} color="#2196F3" />
                    </Pressable>
                    <Pressable
                      style={(s: { pressed: boolean }) => [styles.mobileIconBtn, s.pressed && styles.mobileIconBtnPressed]}
                      onPress={() => openCartModal(navigation)}
                    >
                      <ShoppingCart size={22} color="#333" />
                      <Text style={styles.mobileCartCount}>({getTotalItems()})</Text>
                    </Pressable>
                  </View>
                </View>
                <View style={styles.mobileSearchRow}>
                  <View style={styles.mobileSearchContainer}>
                    <Search size={18} color="#888" style={[styles.searchIcon, { outlineStyle: 'none', outlineWidth: 0 } as any]} />
                    <TextInput
                      style={[styles.headerSearchInput, styles.mobileSearchInput, { outlineStyle: 'none', outlineWidth: 0, outlineColor: 'transparent' } as any]}
                      placeholder="Leite, arroz, pão, vinho, frutas..."
                      value={searchText}
                      onChangeText={setSearchText}
                      placeholderTextColor="#999"
                      selectionColor="#2196F3"
                      editable={true}
                    />
                  </View>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.mobileCategoryRow}
                >
                  <TouchableOpacity
                    style={styles.mobileCategoryChip}
                    onPress={goToAllProducts}
                  >
                    <Text style={styles.mobileCategoryChipText} numberOfLines={1}>Todos</Text>
                  </TouchableOpacity>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.mobileCategoryChip, cat === category && styles.mobileCategoryChipActive]}
                      onPress={() => goToCategory(cat)}
                    >
                      <Text style={[styles.mobileCategoryChipText, cat === category && styles.mobileCategoryChipTextActive]} numberOfLines={1}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ),
          }
        : {
            headerStyle: { height: 90 },
            headerLeft: () => (
              <View style={styles.headerLeftContainer}>
                <TouchableOpacity
                  style={styles.webBackButton}
                  onPress={() => navigation.goBack()}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <ArrowLeft size={22} color="#2196F3" />
                </TouchableOpacity>
                <View style={styles.marketLogoPlaceholder}>
                  <View style={styles.logoIconContainer}>
                    <ShoppingBag size={32} color="#2196F3" strokeWidth={2.5} />
                  </View>
                  <Text style={styles.logoText}>MARKET</Text>
                </View>
              </View>
            ),
            headerTitleAlign: 'center',
            headerTitleContainerStyle: { flex: 1, left: 0, right: 0, justifyContent: 'center', alignItems: 'stretch' },
            headerTitle: () => <SearchBar searchText={searchText} onChangeText={setSearchText} placeholder="Buscar produtos..." />,
            headerRight: () => (
              <View style={styles.headerRightContainer}>
                <Pressable
                  style={(s: { pressed: boolean; hovered?: boolean }) => [styles.headerUserButton, (s.hovered || s.pressed) && styles.headerUserButtonHover]}
                  onPress={() => {}}
                >
                  <User size={20} color="#2196F3" />
                  <Text style={styles.headerUserText}>Entrar</Text>
                </Pressable>
                <Pressable
                  style={(s: { pressed: boolean; hovered?: boolean }) => [styles.headerCartButton, (s.hovered || s.pressed) && styles.headerCartButtonHover]}
                  onPress={() => openCartModal(navigation)}
                >
                  <ShoppingCart size={20} color="#fff" />
                  <Text style={styles.cartButtonText}>({getTotalItems()})</Text>
                </Pressable>
              </View>
            ),
          }
    );
  }, [navigation, marketName, category, getTotalItems, isMobile, categories, searchText, openCartModal]);

  const sections = useMemo((): Section[] => {
    const query = searchText.trim().toLowerCase();
    const byCategory = products.filter((p) => p.category === category);
    const filtered = query
      ? byCategory.filter((p) => p.name.toLowerCase().includes(query))
      : byCategory;
    const bySubcategory = filtered.reduce<Record<string, ProductWithFinalPrice[]>>(
      (acc, product) => {
        const sub = product.subcategory ?? 'Outros';
        if (!acc[sub]) acc[sub] = [];
        acc[sub].push(product);
        return acc;
      },
      {},
    );
    return Object.entries(bySubcategory).map(([title, items]) => ({
      title,
      data: chunk(items, itemsPerRow),
    }));
  }, [products, category, itemsPerRow, searchText]);

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

  const renderRow = ({ item: row }: { item: ProductWithFinalPrice[] }) => (
    <View style={styles.row}>
      {row.map((p) => renderProductCard(p))}
      {row.length < itemsPerRow &&
        Array.from({ length: itemsPerRow - row.length }).map((_, i) => (
          <View key={`empty-${i}`} style={[styles.emptyCard, { width: itemSize }]} />
        ))}
    </View>
  );

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <Text style={styles.sectionHeader}>{section.title}</Text>
  );

  const renderBanner = () => (
    <View style={styles.bannerContainer}>
      <ScrollView
        ref={(el) => {
          bannerScrollRef.current = el;
        }}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleBannerScroll}
        scrollEventThrottle={16}
      >
        {banners.map((banner) => (
          <View key={banner.id} style={[styles.bannerSlide, { width: bannerWidth, backgroundColor: banner.color }]} />
        ))}
      </ScrollView>
      <View style={styles.bannerControls}>
        <TouchableOpacity
          style={[styles.bannerArrow, bannerIndex === 0 && styles.bannerArrowDisabled]}
          onPress={() => goToBanner(Math.max(0, bannerIndex - 1))}
          disabled={bannerIndex === 0}
        >
          <ChevronLeft size={20} color={bannerIndex === 0 ? "#ccc" : "#fff"} />
        </TouchableOpacity>
        <View style={styles.bannerDots}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[
                styles.bannerDot,
                bannerIndex === index && styles.bannerDotActive,
              ]}
            />
          ))}
        </View>
        <TouchableOpacity
          style={[styles.bannerArrow, bannerIndex === banners.length - 1 && styles.bannerArrowDisabled]}
          onPress={() => goToBanner(Math.min(banners.length - 1, bannerIndex + 1))}
          disabled={bannerIndex === banners.length - 1}
        >
          <ChevronRight size={20} color={bannerIndex === banners.length - 1 ? "#ccc" : "#fff"} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {isMobile ? (
        sections.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhum produto nesta categoria.</Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            renderItem={renderRow}
            renderSectionHeader={renderSectionHeader}
            ListHeaderComponent={renderBanner}
            keyExtractor={(item) => item.map((p) => p.id).join('-')}
            contentContainerStyle={styles.list}
            stickySectionHeadersEnabled={false}
          />
        )
      ) : (
        <View style={styles.webRow}>
          <View style={styles.sidebar}>
            <ScrollView
              style={styles.sidebarScroll}
              contentContainerStyle={styles.sidebarScrollContent}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.sidebarTitle}>Categorias</Text>
              <Pressable
              style={[
                styles.sidebarButton,
                hoveredCategory === '__todos__' && styles.sidebarButtonHovered,
              ]}
              onPress={goToAllProducts}
              {...({
                onMouseEnter: () => setHoveredCategory('__todos__'),
                onMouseLeave: () => setHoveredCategory(null),
              } as any)}
            >
              <View style={styles.sidebarButtonContent}>
                <View style={[styles.categoryIconContainer, { backgroundColor: '#2196F320' }]}>
                  <ShoppingBag size={20} color="#2196F3" />
                </View>
                <Text style={[
                  styles.sidebarButtonText,
                  hoveredCategory === '__todos__' && styles.sidebarButtonTextHovered,
                ]}>Todos</Text>
              </View>
              <View style={[styles.categoryAccent, { backgroundColor: '#2196F3' }]} />
            </Pressable>
            {categories.map((cat) => {
              const { Icon, color } = getCategoryIcon(cat);
              return (
                <Pressable
                  key={cat}
                  style={[
                    styles.sidebarButton,
                    cat === category && styles.sidebarButtonActive,
                    hoveredCategory === cat && styles.sidebarButtonHovered,
                  ]}
                  onPress={() => goToCategory(cat)}
                  {...({
                    onMouseEnter: () => setHoveredCategory(cat),
                    onMouseLeave: () => setHoveredCategory(null),
                  } as any)}
                >
                  <View style={styles.sidebarButtonContent}>
                    <View style={[styles.categoryIconContainer, { backgroundColor: `${color}20` }]}>
                      <Icon size={20} color={color} />
                    </View>
                    <Text style={[
                      styles.sidebarButtonText,
                      cat === category && styles.sidebarButtonTextActive,
                      hoveredCategory === cat && styles.sidebarButtonTextHovered,
                    ]}>{cat}</Text>
                  </View>
                  <View style={[styles.categoryAccent, { backgroundColor: color }]} />
                </Pressable>
              );
            })}
            </ScrollView>
          </View>
          <View style={styles.mainContent}>
            {sections.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Nenhum produto nesta categoria.</Text>
              </View>
            ) : (
              <SectionList
                  style={styles.sectionList}
                  sections={sections}
                  renderItem={renderRow}
                  renderSectionHeader={renderSectionHeader}
                  ListHeaderComponent={renderBanner}
                  keyExtractor={(item) => item.map((p) => p.id).join('-')}
                  contentContainerStyle={styles.list}
                  stickySectionHeadersEnabled={false}
                />
            )}
          </View>
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
  headerSearchWrapper: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  headerSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 60,
    width: '100%',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  headerSearchContainerFocused: {
    borderColor: '#2196F3',
    backgroundColor: '#fff',
  },
  searchIcon: {
    marginRight: 8,
  },
  headerSearchInput: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 16,
    minWidth: 0,
    height: '100%',
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  marketLogoPlaceholder: {
    width: 185,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginLeft: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  logoIconContainer: { marginRight: 8 },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2196F3',
    letterSpacing: 1,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 16,
  },
  headerUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerUserButtonHover: { backgroundColor: '#e3f2fd' },
  headerUserText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  headerCartButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerCartButtonHover: { backgroundColor: '#388E3C' },
  cartButtonText: { color: '#fff', fontWeight: 'bold' },
  mobileHeaderRoot: {
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  mobileHeaderRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mobileLogoSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 12,
  },
  mobileLogoText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2196F3',
  },
  mobileLojaSelector: { flex: 1 },
  mobileLojaLabel: {
    fontSize: 12,
    color: '#666',
  },
  mobileLojaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mobileLojaName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  mobileHeaderIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  mobileIconBtnPressed: { opacity: 0.7 },
  mobileCartCount: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  mobileSearchRow: {
    marginBottom: 12,
    alignSelf: 'stretch',
  },
  mobileSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
    minHeight: 45,
  },
  mobileSearchInput: { minHeight: 45 },
  mobileCategoryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  mobileCategoryChip: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  mobileCategoryChipActive: {
    backgroundColor: '#2196F3',
  },
  mobileCategoryChipText: {
    fontSize: 13,
    color: '#1976d2',
    fontWeight: '500',
  },
  mobileCategoryChipTextActive: {
    color: '#fff',
  },
  mobileBackBtn: {
    marginRight: -30,
    padding: 4,
  },
  webBackButton: {
    marginRight: -30,
    padding: 4,
  },
  webRow: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 280,
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
  sidebarScroll: {
    flex: 1,
  },
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
  mainContent: {
    flex: 1,
    flexDirection: 'column',
  },
  sectionList: {
    flex: 1,
  },
  list: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 32,
  },
  bannerContainer: {
    height: 240,
    position: 'relative',
    width: '100%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerSlide: {
    height: 240,
    borderRadius: 12,
  },
  bannerControls: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  bannerArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerArrowDisabled: {
    opacity: 0.3,
  },
  bannerDots: {
    flexDirection: 'row',
    gap: 8,
  },
  bannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  bannerDotActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    marginBottom: 0,
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
    fontSize: 13,
    color: '#888',
    textDecorationLine: 'line-through',
  },
  discountPercent: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 13,
    color: '#000',
    backgroundColor: '#d9e7f2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#b8d4e8',
    marginLeft: 8,
  },
  productPrice: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
    color: '#000',
    marginBottom: 4,
  },
  productPriceMobile: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 19,
    color: '#000',
    marginBottom: 4,
  },
  productNameSlot: {
    minHeight: 36,
    justifyContent: 'center',
    overflow: 'hidden',
    minWidth: 0,
  },
  productName: {
    fontFamily: 'BricolageGrotesque_400Regular',
    fontSize: 14,
    color: '#333',
  },
  productNameMobile: {
    fontFamily: 'BricolageGrotesque_400Regular',
    fontSize: 15,
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
    height: 0,
    minHeight: 0,
  },
});
