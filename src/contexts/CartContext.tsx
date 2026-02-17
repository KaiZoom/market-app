import React, { createContext, useState, useContext, useRef, useEffect, ReactNode } from 'react';
import { Alert, Platform } from 'react-native';
import { ProductWithFinalPrice } from '../models';
import { CartModal } from '../components/CartModal';
import { AddToCartToast } from '../components/AddToCartToast';
import { useAuth } from './AuthContext';

export interface CartItem {
  product: ProductWithFinalPrice;
  quantity: number;
}

export type CartModalNavigation = { navigate: (screen: string, params?: any) => void } | null;

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
  closeCartModalAndGoToCheckout: () => void;
  /** Toast "item adicionado": definido ao adicionar ao carrinho, limpar após exibir. */
  lastAddedToast: AddToCartToastItem | null;
  clearAddToCartToast: () => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

interface CartProviderProps {
  children: ReactNode;
}

const CART_STORAGE_KEY = '@market-app:cart';

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [lastAddedToast, setLastAddedToast] = useState<AddToCartToastItem | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const cartModalNavigationRef = useRef<CartModalNavigation>(null);
  const { user } = useAuth();

  // Carregar carrinho do localStorage na inicialização
  useEffect(() => {
    const loadCart = () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const storedCart = localStorage.getItem(CART_STORAGE_KEY);
          if (storedCart) {
            const { items: storedItems, selectedMarketId: storedMarketId } = JSON.parse(storedCart);
            if (storedItems) setItems(storedItems);
            if (storedMarketId) setSelectedMarketId(storedMarketId);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar carrinho do localStorage:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadCart();
  }, []);

  // Salvar carrinho no localStorage sempre que items ou selectedMarketId mudarem
  useEffect(() => {
    // Não salvar até que o carrinho tenha sido carregado
    if (!isLoaded) return;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const cartData = {
          items,
          selectedMarketId,
        };
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
      }
    } catch (error) {
      console.error('Erro ao salvar carrinho no localStorage:', error);
    }
  }, [items, selectedMarketId, isLoaded]);

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

  const closeCartModalAndGoToCheckout = () => {
    if (!cartModalNavigationRef.current) {
      Alert.alert('Erro', 'Navegação não disponível. Tente novamente.');
      closeCartModal();
      return;
    }
    
    // Se o usuário estiver logado, vai direto para CheckoutData
    // Se não estiver logado, vai para InformarEmail primeiro
    if (user) {
      cartModalNavigationRef.current.navigate('CheckoutData', { email: user.email });
    } else {
      cartModalNavigationRef.current.navigate('InformarEmail');
    }
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
        closeCartModalAndGoToCheckout,
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
