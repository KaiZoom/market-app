import { useCart } from '../../../contexts/CartContext';

/**
 * Hook para lógica do dropdown de sugestões de busca.
 * Centraliza acesso ao carrinho; futuras chamadas de API podem ser adicionadas aqui.
 */
export function useSearchSuggestionsDropdown() {
  return useCart();
}
