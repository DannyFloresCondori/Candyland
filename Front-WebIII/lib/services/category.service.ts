import { fetchData } from '@/services/api';

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  slug?: string;
  imageUrl?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

const BASE_URL = 'categories';

export const categoryService = {
  // 🔹 Crear categoría
  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No se encontró token de autenticación');

    return await fetchData(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  // 🔹 Obtener todas las categorías activas
  async getAll(): Promise<Category[]> {
    try {
      const data = await fetchData(BASE_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return data as Category[];
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return [];
    }
  },

  // 🔹 Obtener una categoría por ID
  async getById(id: string): Promise<Category | null> {
    try {
      const data = await fetchData(`${BASE_URL}/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return data as Category;
    } catch (error) {
      console.error(`Error al obtener categoría con id ${id}:`, error);
      return null;
    }
  },

  // 🔹 Actualizar categoría
  async updateCategory(id: string, data: Partial<CreateCategoryDto>): Promise<Category> {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No se encontró token de autenticación');

    return await fetchData(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  // 🔹 Desactivar categoría (soft delete)
  async deleteCategory(id: string): Promise<{ message: string }> {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No se encontró token de autenticación');

    return await fetchData(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },
};
