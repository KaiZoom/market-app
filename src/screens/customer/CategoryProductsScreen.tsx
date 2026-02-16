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

const MOBILE_BREAKPOINT = 768;
const ITEMS_PER_ROW_WEB = 5;
const ITEMS_PER_ROW_MOBILE = 5;
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

export const CategoryProductsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { marketId, marketName, category } = route.params;
  const [products, setProducts] = useState<ProductWithFinalPrice[]>([]);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const { getTotalItems, addToCart } = useCart();
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
    navigation.navigate('ProductDetail', { product });
  };

  const handleQuickAdd = (product: ProductWithFinalPrice) => {
    if (product.stock === 0) {
      Alert.alert('Estoque Esgotado', 'Este produto não está disponível no momento.');
      return;
    }
    try {
      addToCart(product, 1);
      Alert.alert('Adicionado', '1 unidade adicionada ao carrinho.');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  const imageSize = itemSize - 32;
  const cardMinHeight = imageSize + 72;

  const renderProductCard = (product: ProductWithFinalPrice) => (
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
            source={require('../../../assets/agua-sanitaria.png')}
            style={[styles.productImage, { width: imageSize, height: imageSize }]}
            resizeMode="cover"
          />
          <Pressable
            style={(state: { pressed: boolean; hovered?: boolean }) => [
              styles.quickAddButtonOverlay,
              state.hovered && styles.quickAddButtonOverlayHover,
            ]}
            onPress={() => handleQuickAdd(product)}
          >
            <Text style={styles.quickAddButtonText}>+</Text>
          </Pressable>
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
          <Text style={isMobile ? styles.productNameMobile : styles.productName} numberOfLines={3}>
            {product.name}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

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
          onPress={() => navigation.navigate('Cart')}
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
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  productCardHover: {
    borderColor: '#555',
  },
  productCardTouchable: {
    flex: 1,
  },
  imageWrapper: {
    position: 'relative',
  },
  productImage: {
    borderRadius: 6,
    marginBottom: 6,
  },
  originalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    minHeight: 22,
    marginBottom: 2,
  },
  originalPrice: {
    fontFamily: 'BricolageGrotesque_400Regular',
    fontSize: 14,
    color: '#888',
    textDecorationLine: 'line-through',
  },
  discountPercent: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 14,
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
    fontSize: 17,
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
    minHeight: 40,
    justifyContent: 'center',
  },
  productName: {
    fontFamily: 'BricolageGrotesque_400Regular',
    fontSize: 14,
    color: '#333',
  },
  productNameMobile: {
    fontFamily: 'BricolageGrotesque_400Regular',
    fontSize: 16,
    color: '#333',
  },
  quickAddButtonOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
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
    fontSize: 20,
    lineHeight: 22,
  },
  emptyCard: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
});
