import React, { createContext, useState, useContext, useRef, ReactNode } from 'react';
import { ProductWithFinalPrice } from '../models';
import { CartModal } from '../components/CartModal';
import { AddToCartToast } from '../components/AddToCartToast';

export interface CartItem {
  product: ProductWithFinalPrice;
  quantity: number;
}

export type CartModalNavigation = { navigate: (screen: string) => void } | null;

export interface AddToCartToastItem {
  product: ProductWithFinalPrice;
  quantityAdded: number;
}

interface CartContextData {
  items: CartItem[];
  selectedMarketId: string | null;
  addToCart: (product: ProductWithFinalPrice, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setMarket: (marketId: string) => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
  cartModalVisible: boolean;
  openCartModal: (navigation?: CartModalNavigation) => void;
  closeCartModal: () => void;
  closeCartModalAndGoToMarkets: () => void;
  /** Toast "item adicionado": definido ao adicionar ao carrinho, limpar após exibir. */
  lastAddedToast: AddToCartToastItem | null;
  clearAddToCartToast: () => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [lastAddedToast, setLastAddedToast] = useState<AddToCartToastItem | null>(null);
  const cartModalNavigationRef = useRef<CartModalNavigation>(null);

  const clearAddToCartToast = () => setLastAddedToast(null);

  const openCartModal = (navigation?: CartModalNavigation) => {
    cartModalNavigationRef.current = navigation ?? null;
    setCartModalVisible(true);
  };

  const closeCartModal = () => {
    setCartModalVisible(false);
    cartModalNavigationRef.current = null;
  };

  const closeCartModalAndGoToMarkets = () => {
    cartModalNavigationRef.current?.navigate('Markets');
    closeCartModal();
  };

  const addToCart = (product: ProductWithFinalPrice, quantity: number) => {
    // Validar estoque
    if (quantity > product.stock) {
      throw new Error('Quantidade solicitada maior que o estoque disponível');
    }

    const existingItem = items.find(item => item.product.id === product.id);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        throw new Error('Quantidade total maior que o estoque disponível');
      }
      updateQuantity(product.id, newQuantity);
    } else {
      setItems([...items, { product, quantity }]);
    }
    setLastAddedToast({ product, quantityAdded: quantity });
  };

  const removeFromCart = (productId: string) => {
    setItems(items.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const item = items.find(item => item.product.id === productId);

    if (item && quantity > item.product.stock) {
      throw new Error('Quantidade solicitada maior que o estoque disponível');
    }

    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setItems(
        items.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const setMarket = (marketId: string) => {
    if (selectedMarketId && selectedMarketId !== marketId) {
      clearCart();
    }
    setSelectedMarketId(marketId);
  };

  const getTotalAmount = () => {
    return items.reduce((total, item) => {
      return total + item.product.finalPrice * item.quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        selectedMarketId,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setMarket,
        getTotalAmount,
        getTotalItems,
        cartModalVisible,
        openCartModal,
        closeCartModal,
        closeCartModalAndGoToMarkets,
        lastAddedToast,
        clearAddToCartToast,
      }}
    >
      {children}
      <CartModal />
      <AddToCartToast />
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
