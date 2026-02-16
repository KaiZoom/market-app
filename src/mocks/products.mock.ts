import { Product } from '../models';

/** Mapeamento: nome base do produto -> { category, subcategory } */
const PRODUCT_CATEGORIES: Record<string, { category: string; subcategory: string }> = {
  // Alimentos
  'Arroz': { category: 'Alimentos', subcategory: 'Grãos' },
  'Feijão': { category: 'Alimentos', subcategory: 'Grãos' },
  'Macarrão': { category: 'Alimentos', subcategory: 'Grãos' },
  'Óleo': { category: 'Alimentos', subcategory: 'Temperos' },
  'Açúcar': { category: 'Alimentos', subcategory: 'Temperos' },
  'Sal': { category: 'Alimentos', subcategory: 'Temperos' },
  'Vinagre': { category: 'Alimentos', subcategory: 'Temperos' },
  'Café': { category: 'Alimentos', subcategory: 'Cafés' },
  // Bebidas
  'Leite': { category: 'Laticínios', subcategory: 'Leites' },
  'Refrigerante': { category: 'Bebidas', subcategory: 'Refrigerados' },
  'Suco': { category: 'Bebidas', subcategory: 'Refrigerados' },
  'Água': { category: 'Bebidas', subcategory: 'Refrigerados' },
  'Cerveja': { category: 'Bebidas', subcategory: 'Alcoólicas' },
  'Vinho': { category: 'Bebidas', subcategory: 'Alcoólicas' },
  'Energético': { category: 'Bebidas', subcategory: 'Energéticos' },
  // Limpeza
  'Detergente': { category: 'Limpeza', subcategory: 'Louça' },
  'Sabão em Pó': { category: 'Limpeza', subcategory: 'Roupa' },
  'Amaciante': { category: 'Limpeza', subcategory: 'Roupa' },
  'Desinfetante': { category: 'Limpeza', subcategory: 'Sujeira pesada' },
  'Água Sanitária': { category: 'Limpeza', subcategory: 'Sujeira pesada' },
  // Higiene
  'Shampoo': { category: 'Higiene', subcategory: 'Cabelo' },
  'Condicionador': { category: 'Higiene', subcategory: 'Cabelo' },
  'Sabonete': { category: 'Higiene', subcategory: 'Corpo' },
  'Pasta de Dente': { category: 'Higiene', subcategory: 'Bucal' },
  'Papel Higiênico': { category: 'Higiene', subcategory: 'Papel' },
  // Padaria
  'Pão': { category: 'Padaria', subcategory: 'Pães' },
  'Manteiga': { category: 'Padaria', subcategory: 'Manteiga' },
  // Açougue
  'Carne Bovina': { category: 'Açougue', subcategory: 'Bovino' },
  'Frango': { category: 'Açougue', subcategory: 'Aves' },
  'Peixe': { category: 'Açougue', subcategory: 'Peixes' },
  'Linguiça': { category: 'Açougue', subcategory: 'Embutidos' },
  'Bacon': { category: 'Açougue', subcategory: 'Embutidos' },
  // Hortifruti
  'Tomate': { category: 'Hortifruti', subcategory: 'Legumes' },
  'Alface': { category: 'Hortifruti', subcategory: 'Verduras' },
  'Cebola': { category: 'Hortifruti', subcategory: 'Legumes' },
  'Batata': { category: 'Hortifruti', subcategory: 'Legumes' },
  'Cenoura': { category: 'Hortifruti', subcategory: 'Legumes' },
  'Banana': { category: 'Hortifruti', subcategory: 'Frutas' },
  'Maçã': { category: 'Hortifruti', subcategory: 'Frutas' },
  'Laranja': { category: 'Hortifruti', subcategory: 'Frutas' },
  // Frios
  'Queijo': { category: 'Frios', subcategory: 'Queijos' },
  'Presunto': { category: 'Frios', subcategory: 'Frios' },
  'Mortadela': { category: 'Frios', subcategory: 'Frios' },
  // Laticínios
  'Iogurte': { category: 'Laticínios', subcategory: 'Fermentados' },
  'Requeijão': { category: 'Laticínios', subcategory: 'Cremes' },
  // Mercearia
  'Biscoito': { category: 'Mercearia', subcategory: 'Snacks' },
  'Chocolate': { category: 'Mercearia', subcategory: 'Snacks' },
  'Bala': { category: 'Mercearia', subcategory: 'Snacks' },
  'Salgadinho': { category: 'Mercearia', subcategory: 'Snacks' },
  'Sorvete': { category: 'Mercearia', subcategory: 'Snacks' },
  'Farinha': { category: 'Mercearia', subcategory: 'Farináceos' },
  'Fermento': { category: 'Mercearia', subcategory: 'Farináceos' },
  'Molho de Tomate': { category: 'Mercearia', subcategory: 'Molhos' },
  'Maionese': { category: 'Mercearia', subcategory: 'Molhos' },
  'Mostarda': { category: 'Mercearia', subcategory: 'Molhos' },
  'Ovo': { category: 'Mercearia', subcategory: 'Básicos' },
  'Margarina': { category: 'Mercearia', subcategory: 'Básicos' },
  'Creme de Leite': { category: 'Mercearia', subcategory: 'Básicos' },
  'Leite Condensado': { category: 'Mercearia', subcategory: 'Básicos' },
};

const productNames = Object.keys(PRODUCT_CATEGORIES);

const prefixes = ['Premium', 'Super', 'Extra', 'Mega', 'Top', 'Master', 'Plus', 'Gold'];
const suffixes = ['Especial', 'Tradicional', 'Gourmet', 'Light', 'Diet', 'Integral', 'Natural'];

function generateRandomStock(): number {
  return Math.floor(Math.random() * 100) + 1;
}

function generateRandomPrice(): number {
  return Math.round((Math.random() * 50 + 1) * 100) / 100;
}

function generateRandomDiscount(): number {
  const hasDiscount = Math.random() > 0.7;
  return hasDiscount ? Math.floor(Math.random() * 30) : 0;
}

function generateProductName(index: number): string {
  const baseName = productNames[index % productNames.length];
  const prefix = Math.random() > 0.6 ? prefixes[Math.floor(Math.random() * prefixes.length)] + ' ' : '';
  const suffix = Math.random() > 0.6 ? ' ' + suffixes[Math.floor(Math.random() * suffixes.length)] : '';
  return `${prefix}${baseName}${suffix}`;
}

function getCategoryAndSubcategory(index: number): { category: string; subcategory: string } {
  const baseName = productNames[index % productNames.length];
  return PRODUCT_CATEGORIES[baseName];
}

function generateProducts(marketId: string, count: number): Product[] {
  const products: Product[] = [];

  for (let i = 0; i < count; i++) {
    const { category, subcategory } = getCategoryAndSubcategory(i);
    products.push({
      id: `${marketId}-product-${i + 1}`,
      marketId,
      name: generateProductName(i),
      description: `Produto de qualidade para seu dia a dia`,
      price: generateRandomPrice(),
      stock: generateRandomStock(),
      discount: generateRandomDiscount(),
      imageUrl: `https://via.placeholder.com/150?text=Produto+${i + 1}`,
      category,
      subcategory,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });
  }

  return products;
}

// Gerar 100 produtos para cada mercado
export const PRODUCTS_MOCK: Product[] = [
  ...generateProducts('market-a', 100),
  ...generateProducts('market-b', 100),
  ...generateProducts('market-c', 100),
];
