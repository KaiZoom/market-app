import { useEffect, useRef } from 'react';
import { Animated, useWindowDimensions, Platform } from 'react-native';
import { useCart } from '../../../contexts/CartContext';

const TOAST_DURATION_MS = 3500;
const BOTTOM_OFFSET = Platform.OS === 'web' ? 24 : 88;

export function useAddToCartToast() {
  const { lastAddedToast, clearAddToCartToast } = useCart();
  const { width } = useWindowDimensions();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    if (!lastAddedToast) return;

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 24,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => clearAddToCartToast());
    }, TOAST_DURATION_MS);

    opacity.setValue(0);
    translateY.setValue(24);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    return () => clearTimeout(timer);
  }, [lastAddedToast?.product.id, lastAddedToast?.quantityAdded, opacity, translateY, clearAddToCartToast]);

  return {
    lastAddedToast,
    opacity,
    translateY,
    toastWidth: Math.min(400, width - 32),
    bottomOffset: BOTTOM_OFFSET,
  };
}
