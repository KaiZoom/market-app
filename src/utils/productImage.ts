import { ProductImageSource } from '../models';

export type ImageSourceProp = { uri: string } | number;

/** Valor usado no mock para "usar imagem padrão" (resolvida com require no componente). */
export const DEFAULT_IMAGE_KEY = 'default';

/**
 * Converte ProductImageSource (string | number) para o formato aceito por <Image source={...} />.
 * Use fallback quando o produto não tiver imagem ou quando for DEFAULT_IMAGE_KEY.
 */
export function getProductImageSource(
  src: ProductImageSource | undefined,
  fallback: number
): ImageSourceProp {
  if (src === undefined || src === DEFAULT_IMAGE_KEY) {
    console.log('[getProductImageSource] Usando fallback, src=', src);
    return fallback;
  }
  
  // Se src é um número (require() retornar um número)
  if (typeof src === 'number') {
    return src;
  }
  
  // Se src é string, envolver em {uri: ...}
  if (typeof src === 'string') {
    return { uri: src };
  }
  
  // Se src já é um objeto (ex: {uri, width, height} do require())
  if (typeof src === 'object' && src !== null && 'uri' in src) {
    console.log('[getProductImageSource] Objeto com URI detectado, passando direto:', src);
    return src as ImageSourceProp;
  }
  
  console.log('[getProductImageSource] Caso não tratado, usando fallback. src=', src);
  return fallback;
}
