// src/lib/services/order.service.ts
import { fetchData } from '@/services/api';

export interface OrderDetail {
  id?: string;
  productId: string;
  quantity: number;
  unitPrice?: number;
  subTotal?: number;
  product?: {
    id: string;
    name: string;
    images?: string[];
  };
}

export interface Order {
  id: string;
  userId: string;
  nameClient: string;
  nameCompany?: string;
  status?: string;
  total?: number;
  orderDetails: OrderDetail[];
  createdAt: string;
}

export interface CreateOrderData {
  nameClient: string;
  nameCompany?: string;
  status?: string;
  total?: number;
  userId: string;
  orderDetails: {
    productId: string;
    quantity: number;
    unitPrice?: number;
    subTotal?: number;
  }[];
}

const BASE_URL = 'orders';

export const orderService = {
  /**
   * Crear una nueva orden
   */
  async createOrder(orderData: CreateOrderData): Promise<Order> {
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

  /**
   * Obtener todas las órdenes (Pendientes y Vendidas)
   */
  async getAllOrders(): Promise<Order[]> {
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
      return orders as Order[];
    } catch (error) {
      console.error('Error al obtener las órdenes:', error);
      return [];
    }
  },

  /**
   * Obtener una orden por ID
   */
  async getOrderById(id: string): Promise<Order> {
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

  /**
   * Rechazar (eliminar lógicamente) una orden por ID
   */
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

   /**
   * Marcar un pedido como vendido
   */
   async markAsSold(id: string): Promise<Order> {
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
};
