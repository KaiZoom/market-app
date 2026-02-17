import React, { useEffect, useState, useMemo } from 'react';
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
} from 'react-native';
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

export const CategoryProductsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { marketId, marketName, category } = route.params;
  const [products, setProducts] = useState<ProductWithFinalPrice[]>([]);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithFinalPrice | null>(null);
  const { getTotalItems, addToCart, openCartModal, items, updateQuantity } = useCart();
  const { width } = useWindowDimensions();

  const isMobile = width < MOBILE_BREAKPOINT;
  const itemsPerRow = isMobile ? ITEMS_PER_ROW_MOBILE : ITEMS_PER_ROW_WEB;

  const itemSize = useMemo(() => {
    const n = itemsPerRow;
    const totalGap = GAP * (n - 1);
    const extraBuffer = !isMobile ? WEB_LAYOUT_BUFFER : 0;
    const availableWidth = width - PADDING_HORIZONTAL * 2 - totalGap - extraBuffer;
    return Math.floor(availableWidth / n);
  }, [width, itemsPerRow, isMobile]);

  useEffect(() => {
    const data = productService.getProductsByMarket(marketId);
    setProducts(data);
  }, [marketId]);

  const sections = useMemo((): Section[] => {
    const byCategory = products.filter((p) => p.category === category);
    const bySubcategory = byCategory.reduce<Record<string, ProductWithFinalPrice[]>>(
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
  }, [products, category, itemsPerRow]);

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
          <View key={`empty-${i}`} style={[styles.productCard, styles.emptyCard, { width: itemSize, minHeight: cardMinHeight }]} />
        ))}
    </View>
  );

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <Text style={styles.sectionHeader}>{section.title}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{marketName}</Text>
          <Text style={styles.categoryTitle}>{category}</Text>
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => openCartModal(navigation)}
        >
          <Text style={styles.cartButtonText}>Carrinho ({getTotalItems()})</Text>
        </TouchableOpacity>
      </View>

      {sections.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nenhum produto nesta categoria.</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderRow}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.map((p) => p.id).join('-')}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
        />
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
  header: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flex: 1,
  },
  backButton: {
    marginBottom: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoryTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
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
  list: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 32,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    marginBottom: GAP,
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
