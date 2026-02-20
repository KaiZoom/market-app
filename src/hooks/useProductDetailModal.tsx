import React, { useState, useCallback } from 'react';
import { ProductWithFinalPrice } from '../models';
import { useCart } from '../contexts/CartContext';
import { ProductDetailModal } from '../components/ProductDetailModal';

export interface UseProductDetailModalResult {
  /** Abre o modal de detalhe do produto. */
  openProductModal: (product: ProductWithFinalPrice) => void;
  /** Nó do modal para renderizar na tela (ex.: dentro do SafeAreaView). */
  productDetailModal: React.ReactNode;
}

/**
 * Encapsula o estado do produto selecionado e o modal de detalhe.
 * Use nas telas de listagem (produtos, categoria, busca) para evitar repetir
 * estado + ProductDetailModal em cada uma.
 */
export function useProductDetailModal(
  marketProducts: ProductWithFinalPrice[],
  navigation: any
): UseProductDetailModalResult {
  const [selectedProduct, setSelectedProduct] = useState<ProductWithFinalPrice | null>(null);
  const { openCartModal } = useCart();

  const openProductModal = useCallback((product: ProductWithFinalPrice) => {
    setSelectedProduct(product);
  }, []);

  const productDetailModal = (
    <ProductDetailModal
      visible={!!selectedProduct}
      product={selectedProduct}
      marketProducts={marketProducts}
      onClose={() => setSelectedProduct(null)}
      onGoToCart={() => openCartModal(navigation)}
      onSelectProduct={setSelectedProduct}
    />
  );

  return { openProductModal, productDetailModal };
}
