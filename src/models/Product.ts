/** Fonte de imagem: URI (string) ou require() local (number). */
export type ProductImageSource = string | number;

export interface Product {
  id: string;
  marketId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  discount: number; // Percentual (0-100)
  imageUrl: string;
  /** Lista de imagens do produto. Use para galeria e exibição. */
  images: ProductImageSource[];
  category: string;
  subcategory?: string; // ex: Limpeza > Sujeira pesada (Água Sanitária)
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithFinalPrice extends Product {
  finalPrice: number;
}
