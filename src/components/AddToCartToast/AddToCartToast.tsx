import React from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { getProductImageSource } from '../../utils/productImage';
import { truncateProductName } from '../../utils/productName';
import { useAddToCartToast } from './hooks/useAddToCartToast';

const DEFAULT_PRODUCT_IMAGE = require('../../../assets/agua-sanitaria.png');

export const AddToCartToast: React.FC = () => {
  const { lastAddedToast, opacity, translateY, toastWidth, bottomOffset } = useAddToCartToast();

  if (!lastAddedToast) return null;

  const { product, quantityAdded } = lastAddedToast;
  const secondLine = product.subcategory
    ? `${product.category} - ${product.subcategory}`
    : product.category;
  const displaySecondLine = secondLine.length > 28 ? `${secondLine.slice(0, 25)}...` : secondLine;

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          bottom: bottomOffset,
          opacity,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={[styles.toast, { width: toastWidth }]}>
        <View style={styles.quantityBox}>
          <Text style={styles.quantityText}>{quantityAdded}</Text>
        </View>
        <View style={styles.thumbWrap}>
          <Image
            source={getProductImageSource(product.images?.[0], DEFAULT_PRODUCT_IMAGE)}
            style={styles.thumb}
            resizeMode="cover"
          />
        </View>
        <View style={styles.details}>
          <Text style={styles.productName} numberOfLines={1}>
            {truncateProductName(product.name)}
          </Text>
          <Text style={styles.productDesc} numberOfLines={1}>
            {displaySecondLine}
          </Text>
        </View>
        <Text style={styles.price}>R$ {product.finalPrice.toFixed(2)}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  quantityBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1976d2',
  },
  thumbWrap: {
    width: 44,
    height: 44,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  details: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  productDesc: {
    fontSize: 12,
    color: '#888',
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
});
