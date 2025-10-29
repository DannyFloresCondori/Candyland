// src/lib/services/product.service.ts
import { fetchData } from '@/services/api';
import { PaginatedResponse, PaginationParams } from '@/types';

// 🔹 Definición correcta del tipo de imagen
export interface ProductImage {
  id: string;
  url: string;
  productId?: string;
  createdAt?: string;
}

// 🔹 Interface para crear imágenes (sin ID)
export interface CreateProductImage {
  url: string;
}

// 🔹 Interface del producto (corregida)
export interface Product {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  price: number;
  stock: number;
  isAvailable?: boolean;
  isActive?: boolean;
  images?: Array<string | ProductImage>; // puede venir como string[] o ProductImage[]
  categoryId: string;
  category?: {
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

const BASE_URL = 'products';

export const productService = {
  // 🔹 Crear producto
  async createProduct(productData: Omit<Product, 'id' | 'images'> & { images?: CreateProductImage[] | string[] }) {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No se encontró token de autenticación');

    // Asegurar que las imágenes se envían como string[] (urls)
    const images = (productData as any).images;
    let normalizedImages: string[] | undefined;
    if (images) {
      if (Array.isArray(images) && images.length > 0) {
        // Si los elementos son objetos con { url }, mapear a string
        if (typeof images[0] === 'object' && images[0] !== null && 'url' in images[0]) {
          normalizedImages = images.map((i: any) => i.url).filter(Boolean);
        } else {
          // Suponemos que ya son strings
          normalizedImages = images as string[];
        }
      }
    }

    const payload = {
      ...productData,
      images: normalizedImages,
    };

    return await fetchData(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },

  // 🔹 Obtener productos con paginación
  async getAllProducts(params?: PaginationParams): Promise<PaginatedResponse<Product>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const url = queryParams.toString() ? `${BASE_URL}?${queryParams}` : BASE_URL;
      
      const data = await fetchData(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      // Verificar si la respuesta ya tiene la estructura paginada
      if (data && typeof data === 'object' && 'data' in data && 'pagination' in data) {
        // Normalizar cada producto para asegurar categoryId e images
        const normalized = (data.data || []).map((p: any) => ({
          ...p,
          categoryId: p.categoryId || p.category?.id || '',
          images: p.images?.map((img: any) => (typeof img === 'string' ? { url: img } : img)) || [],
        }));

        return { data: normalized, pagination: data.pagination } as PaginatedResponse<Product>;
      }
      
      // Si no está paginada, crear la estructura
      const rawArray = Array.isArray(data) ? data : [];
      const normalizedArray = rawArray.map((p: any) => ({
        ...p,
        categoryId: p.categoryId || p.category?.id || '',
        images: p.images?.map((img: any) => (typeof img === 'string' ? { url: img } : img)) || [],
      }));

      const paginatedResponse = {
        data: normalizedArray,
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 5,
          total: Array.isArray(data) ? data.length : 0,
          totalPages: Math.ceil((Array.isArray(data) ? data.length : 0) / (params?.limit || 5)),
          hasNextPage: false,
          hasPrevPage: (params?.page || 1) > 1,
        }
      };
      
      return paginatedResponse;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 5,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        }
      };
    }
  },

  // 🔹 Obtener todos los productos sin paginación (para compatibilidad)
  async getAllProductsUnpaginated(): Promise<Product[]> {
    try {
      const data = await fetchData(`${BASE_URL}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      // Si la respuesta es paginada, extraer solo los datos
      if (data && typeof data === 'object' && 'data' in data) {
        return (data.data || []).map((p: any) => ({
          ...p,
          categoryId: p.categoryId || p.category?.id || '',
          images: p.images?.map((img: any) => (typeof img === 'string' ? { url: img } : img)) || [],
        })) as Product[];
      }
      return (data as any[] || []).map((p: any) => ({
        ...p,
        categoryId: p.categoryId || p.category?.id || '',
        images: p.images?.map((img: any) => (typeof img === 'string' ? { url: img } : img)) || [],
      })) as Product[];
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return [];
    }
  },

  // 🔹 Obtener productos por categoría
  async getProductsByCategoryId(categoryId: string): Promise<Product[]> {
    try {
      const data = await fetchData(`${BASE_URL}/category/${categoryId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return (data as any[] || []).map((p: any) => ({
        ...p,
        categoryId: p.categoryId || p.category?.id || '',
        images: p.images?.map((img: any) => (typeof img === 'string' ? { url: img } : img)) || [],
      })) as Product[];
    } catch (error) {
      console.error(`Error al obtener productos por categoría ${categoryId}:`, error);
      return [];
    }
  },

  // 🔹 Obtener producto por ID
  async getProductById(id: string): Promise<Product | null> {
    try {
      const data = await fetchData(`${BASE_URL}/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return data as Product;
    } catch (error) {
      console.error(`Error al obtener producto con id ${id}:`, error);
      return null;
    }
  },

  // 🔹 Actualizar producto
  async updateProduct(id: string, productData: Partial<Omit<Product, 'images'> & { images?: CreateProductImage[] | string[] }>) {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No se encontró token de autenticación');

    // Normalizar imágenes como en createProduct
    const images = (productData as any).images;
    let normalizedImages: string[] | undefined;
    if (images) {
      if (Array.isArray(images) && images.length > 0) {
        if (typeof images[0] === 'object' && images[0] !== null && 'url' in images[0]) {
          normalizedImages = images.map((i: any) => i.url).filter(Boolean);
        } else {
          normalizedImages = images as string[];
        }
      }
    }

    const payload = {
      ...productData,
      images: normalizedImages,
    };

    return await fetchData(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },

  // 🔹 Eliminar producto
  async deleteProduct(id: string) {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No se encontró token de autenticación');

    return await fetchData(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
