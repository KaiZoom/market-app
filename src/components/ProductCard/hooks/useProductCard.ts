import { useState, useCallback } from 'react';

/** Tamanho da imagem = size - 24; altura mínima do card = imageSize + 64 */
export function cardDimensions(size: number) {
  const imageSize = size - 24;
  const cardMinHeight = imageSize + 64;
  return { imageSize, cardMinHeight };
}

export function useProductCard() {
  const [hovered, setHovered] = useState(false);

  const onMouseEnter = useCallback(() => setHovered(true), []);

  const onMouseLeave = useCallback((e: any) => {
    const related = e?.nativeEvent?.relatedTarget;
    const current = e?.currentTarget;
    if (current && related && current.contains(related)) return;
    setHovered(false);
  }, []);

  return { hovered, onMouseEnter, onMouseLeave };
}
