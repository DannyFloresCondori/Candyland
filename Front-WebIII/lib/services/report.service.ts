import { fetchData } from '@/services/api';

const BASE_URL = '';

export const reportService = {
  /**
   * Generar reporte PDF para una orden de desktop
   */
  async generateOrderReport(orderId: string): Promise<Blob> {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No se encontró token de autenticación');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/report-pdf/factura/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al generar el reporte PDF');
    }

    return response.blob();
  },

  /**
   * Generar reporte PDF para una orden de ecommerce
   */
  async generateEcommerceReport(orderId: string): Promise<Blob> {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No se encontró token de autenticación');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/ecommerce-report-pdf/factura/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al generar el reporte PDF');
    }

    return response.blob();
  },

  /**
   * Descargar un archivo PDF
   */
  downloadPdf(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
