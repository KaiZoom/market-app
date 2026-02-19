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
  Alert,
  useWindowDimensions,
} from 'react-native';
import { Plus, Minus, Trash } from 'lucide-react-native';
import { ProductWithFinalPrice } from '../models';
import { useCart } from '../contexts/CartContext';
import { getProductImageSource } from '../utils/productImage';

const DEFAULT_PRODUCT_IMAGE = require('../../assets/agua-sanitaria.png');

const SEARCH_BAR_HORIZONTAL_PADDING = 16;

interface SearchSuggestionsModalProps {
  visible: boolean;
  searchTerm: string;
  results: ProductWithFinalPrice[];
  onClose: () => void;
  /** Altura do header (barra com a pesquisa) para colar o dropdown logo abaixo. Ex: 90 (web) ou 200 (mobile). */
  headerHeight?: number;
}

export const SearchSuggestionsModal: React.FC<SearchSuggestionsModalProps> = ({
  visible,
  searchTerm,
  results,
  onClose,
  headerHeight = 90,
}) => {
  const { width } = useWindowDimensions();
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();

  const cartQtyMap = React.useMemo(() => {
    const m = new Map<string, number>();
    items.forEach((i) => m.set(i.product.id, i.quantity));
    return m;
  }, [items]);

  const handleAdd = (product: ProductWithFinalPrice) => {
    if (product.stock === 0) {
      Alert.alert('Estoque Esgotado', 'Este produto não está disponível no momento.');
      return;
    }
    try {
      addToCart(product, 1);
    } catch (e: unknown) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Erro ao adicionar');
    }
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    const qty = cartQtyMap.get(productId) ?? 0;
    const newQty = qty + delta;
    try {
      if (newQty <= 0) removeFromCart(productId);
      else updateQuantity(productId, newQty);
    } catch (e: unknown) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Erro');
    }
  };

  const dropdownWidth = width - SEARCH_BAR_HORIZONTAL_PADDING * 2;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.wrapper} pointerEvents="box-none">
        {/* Área do header: toques passam para a barra de pesquisa (não rouba foco) */}
        <View
          style={[styles.headerPassThrough, { height: headerHeight }]}
          pointerEvents="none"
        />
        {/* Backdrop abaixo do header: toque fecha o modal (renderizado antes do dropdown) */}
        <Pressable
          style={[styles.backdrop, { top: headerHeight }]}
          onPress={onClose}
        />
        {/* Dropdown colado abaixo da barra, mesma largura (por cima do backdrop) */}
        <View
          style={[
            styles.dropdown,
            {
              top: headerHeight,
              left: SEARCH_BAR_HORIZONTAL_PADDING,
              width: dropdownWidth,
            },
          ]}
        >
          <View style={styles.headerBar} />
          <View style={styles.titleRow}>
            <Text style={styles.title}>Sugestões</Text>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            {results.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum resultado para &quot;{searchTerm}&quot;</Text>
            ) : (
              results.map((product) => {
                const cartQty = cartQtyMap.get(product.id) ?? 0;
                const inCart = cartQty > 0;

                return (
                  <View key={product.id} style={styles.row}>
                    <View style={styles.imageWrap}>
                      <Image
                        source={getProductImageSource(product.images?.[0], DEFAULT_PRODUCT_IMAGE)}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={styles.info}>
                      <Text style={styles.productName} numberOfLines={3}>
                        {product.name}
                      </Text>
                      <Text style={styles.priceRow}>
                        R$ {product.finalPrice.toFixed(2)}
                        <Text style={styles.unit}> Un</Text>
                      </Text>
                    </View>
                    <View style={styles.actions}>
                      {inCart ? (
                        <View style={styles.quantityControl}>
                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() =>
                              cartQty === 1
                                ? removeFromCart(product.id)
                                : handleQuantityChange(product.id, -1)
                            }
                          >
                            {cartQty === 1 ? (
                              <Trash size={18} color="#fff" />
                            ) : (
                              <Minus size={18} color="#fff" />
                            )}
                          </TouchableOpacity>
                          <Text style={styles.qtyValue}>{cartQty}</Text>
                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => handleQuantityChange(product.id, 1)}
                            disabled={cartQty >= product.stock}
                          >
                            <Plus size={18} color={cartQty >= product.stock ? '#888' : '#fff'} />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.addButton}
                          onPress={() => handleAdd(product)}
                          disabled={product.stock === 0}
                        >
                          <Plus size={20} color="#fff" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {results.length > 0 && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Exibindo resultados para: <Text style={styles.footerTerm}>{searchTerm}</Text>
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  headerPassThrough: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerBar: {
    height: 6,
    backgroundColor: '#1565C0',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  titleRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 15,
    color: '#888',
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
    maxHeight: 400,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  imageWrap: {
    width: 56,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    marginRight: 12,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  priceRow: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  unit: {
    fontSize: 13,
    fontWeight: '400',
    color: '#888',
  },
  actions: {
    marginLeft: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1565C0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1565C0',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 4,
    gap: 4,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    minWidth: 20,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#666',
  },
  footerTerm: {
    fontWeight: '700',
    color: '#333',
  },
});
