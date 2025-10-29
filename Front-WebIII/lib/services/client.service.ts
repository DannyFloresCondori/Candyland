// src/lib/services/client.service.ts
import { fetchData } from '@/services/api';

// Interface del cliente (adaptable según tu backend)
export interface Client {
  id: string;
  firstName: string;
  email: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const BASE_URL = 'clients'; // Endpoint en tu backend para clientes

export const clientService = {
  // 🔹 Crear cliente
  async createClient(clientData: Omit<Client, 'id'>) {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No se encontró token de autenticación');

    return await fetchData(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(clientData),
    });
  },

  // 🔹 Obtener todos los clientes (con paginación)
  async getAllClients(page: number = 1, limit: number = 5): Promise<Client[]> {
    try {
      const data = await fetchData(`${BASE_URL}?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return data as Client[];
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      return [];
    }
  },

  // 🔹 Obtener un cliente por ID
  async getClientById(id: string): Promise<Client | null> {
    try {
      const data = await fetchData(`${BASE_URL}/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return data as Client;
    } catch (error) {
      console.error(`Error al obtener cliente con id ${id}:`, error);
      return null;
    }
  },

  // 🔹 Actualizar cliente
  async updateClient(id: string, clientData: Partial<Client>) {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No se encontró token de autenticación');

    return await fetchData(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(clientData),
    });
  },

  // 🔹 Eliminar (desactivar) cliente
  async deleteClient(id: string) {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No se encontró token de autenticación');

    return await fetchData(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};
