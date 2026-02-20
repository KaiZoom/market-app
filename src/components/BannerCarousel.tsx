import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const DEFAULT_BANNERS = [
  { id: 1, color: '#2196F3' },
  { id: 2, color: '#F44336' },
  { id: 3, color: '#4CAF50' },
  { id: 4, color: '#FF9800' },
];

const BANNER_HEIGHT = 240;
const AUTO_PLAY_INTERVAL_MS = 10000;

export interface BannerItem {
  id: number;
  color: string;
}

export interface BannerCarouselProps {
  /** Largura do container (e de cada slide). Ex.: no mobile = width da tela; no desktop = width - sidebar. */
  width: number;
  /** Lista de slides. Se não informado, usa os 4 banners padrão (azul, vermelho, verde, laranja). */
  banners?: BannerItem[];
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  width,
  banners = DEFAULT_BANNERS,
}) => {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView | null>(null);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / width);
      setIndex(newIndex);
    },
    [width],
  );

  const goTo = useCallback(
    (newIndex: number) => {
      setIndex(newIndex);
      scrollRef.current?.scrollTo({
        x: newIndex * width,
        animated: true,
      });
    },
    [width],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % banners.length;
        scrollRef.current?.scrollTo({
          x: next * width,
          animated: true,
        });
        return next;
      });
    }, AUTO_PLAY_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [width, banners.length]);

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
