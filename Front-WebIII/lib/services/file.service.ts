// src/lib/services/file.service.ts
import { fetchData } from '@/services/api';

const BASE_URL = 'files';

export const fileService = {
  // 🔹 Subir un archivo
  async uploadFile(file: File): Promise<string> {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No se encontró token de autenticación');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/${BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error al subir archivo: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;
  },

  // 🔹 Subir múltiples archivos
  async uploadMultipleFiles(files: File[]): Promise<string[]> {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No se encontró token de autenticación');

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/${BASE_URL}/upload-multiple`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error al subir archivos: ${response.statusText}`);
    }

    const data = await response.json();
    return data.urls;
  },

  // 🔹 Convertir archivo a URL temporal para preview
  createObjectURL(file: File): string {
    return URL.createObjectURL(file);
  },

  // 🔹 Liberar URL temporal
  revokeObjectURL(url: string): void {
    URL.revokeObjectURL(url);
  },
};
