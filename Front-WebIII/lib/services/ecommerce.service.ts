// src/lib/services/ecommerce.service.ts
import { fetchData } from '@/services/api';

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

export interface EcommerceDetail {
  id: string;
  productId: string;
  quantity: number;
  unitPrice?: number;
  subTotal?: number;
  product?: Product;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  price: number;
  stock: number;
  isAvailable?: boolean;
  isActive?: boolean;
  images?: ProductImage[]; // ⚡ Corregido: antes era string[]
  categoryId: string;
  category?: {
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface EcommerceOrder {
  id: string;
  clientId: string;
  client?: {
    address: string;
    phone: string;
  };
  userId: string;
  nameClient: string;
  nameCompany?: string;
  status?: string;
  total?: number;
  ecommerceDetail: EcommerceDetail[];
  createdAt: string;
}

const BASE_URL = 'ecommerce';

export const ecommerceService = {
  async createOrder(orderData: any) {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No se encontró token de autenticación');

    return await fetchData(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
  },

  async getOrdersByClient(clientId: string): Promise<EcommerceOrder[]> {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No se encontró token de autenticación');

    try {
      const orders = await fetchData(BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      // 🔒 Normalizamos las imágenes de cada producto
      const normalized = (orders as EcommerceOrder[]).map(order => ({
        ...order,
        ecommerceDetail: order.ecommerceDetail.map(detail => ({
          ...detail,
          product: detail.product
            ? {
                ...detail.product,
                images: Array.isArray(detail.product.images)
                  ? detail.product.images
                  : detail.product.images
                  ? [detail.product.images]
                  : [],
              }
            : undefined,
        })),
      }));

      return normalized;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  async getOrderById(id: string): Promise<EcommerceOrder> {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No se encontró token de autenticación');

    return await fetchData(`${BASE_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 🔹 Actualizar estado del pedido (igual que markAsSold)
  async markAsSold(id: string): Promise<EcommerceOrder> {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No se encontró token de autenticación');

    return await fetchData(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: 'Vendido' }),
    });
  },

  async rejectOrder(id: string): Promise<{ message: string }> {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No se encontró token de autenticación');

    return await fetchData(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 🔹 Nuevo: Contar pedidos en línea pendientes
  async getPendingEcommerceCount(): Promise<number> {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No se encontró token de autenticación');

    try {
      const orders = await fetchData(BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const pendingOrders = (orders as EcommerceOrder[]).filter(
        (order) => order.status === 'Pendiente'
      );

      return pendingOrders.length;
    } catch (error) {
      console.error('Error fetching pending ecommerce orders:', error);
      return 0;
    }
  },
};
