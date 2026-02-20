import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useBannerCarousel } from './hooks/useBannerCarousel';
import type { BannerItem } from './hooks/useBannerCarousel';

const DEFAULT_BANNERS: BannerItem[] = [
  { id: 1, color: '#2196F3' },
  { id: 2, color: '#F44336' },
  { id: 3, color: '#4CAF50' },
  { id: 4, color: '#FF9800' },
];

const BANNER_HEIGHT = 240;

export type { BannerItem };

export interface BannerCarouselProps {
  width: number;
  banners?: BannerItem[];
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  width,
  banners = DEFAULT_BANNERS,
}) => {
  const { index, scrollRef, handleScroll, goTo } = useBannerCarousel(width, banners);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={(el) => {
          scrollRef.current = el;
        }}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {banners.map((banner) => (
          <View
            key={banner.id}
            style={[styles.slide, { width, backgroundColor: banner.color }]}
          />
        ))}
      </ScrollView>
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.arrow, index === 0 && styles.arrowDisabled]}
          onPress={() => goTo(Math.max(0, index - 1))}
          disabled={index === 0}
        >
          <ChevronLeft size={20} color={index === 0 ? '#ccc' : '#fff'} />
        </TouchableOpacity>
        <View style={styles.dots}>
          {banners.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, index === i && styles.dotActive]}
            />
          ))}
        </View>
        <TouchableOpacity
          style={[styles.arrow, index === banners.length - 1 && styles.arrowDisabled]}
          onPress={() => goTo(Math.min(banners.length - 1, index + 1))}
          disabled={index === banners.length - 1}
        >
          <ChevronRight size={20} color={index === banners.length - 1 ? '#ccc' : '#fff'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: BANNER_HEIGHT,
    position: 'relative',
    width: '100%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  slide: {
    height: BANNER_HEIGHT,
    borderRadius: 12,
  },
  controls: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  arrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowDisabled: {
    opacity: 0.3,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 24,
  },
});
