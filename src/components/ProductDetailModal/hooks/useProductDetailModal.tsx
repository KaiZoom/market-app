import React, { useState, useCallback } from 'react';
import { ProductWithFinalPrice } from '../../../models';
import { useCart } from '../../../contexts/CartContext';
import { ProductDetailModal } from '../ProductDetailModal';

export interface UseProductDetailModalResult {
  openProductModal: (product: ProductWithFinalPrice) => void;
  productDetailModal: React.ReactNode;
}

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
