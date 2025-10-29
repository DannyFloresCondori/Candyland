'use client';

import { useState } from 'react';
import { reportService } from '@/lib/services/report.service';
import { toast } from 'sonner';

export function usePdfReport() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateOrderReport = async (orderId: string, orderType: 'order' | 'ecommerce') => {
    setIsGenerating(true);
    try {
      let blob: Blob;
      
      if (orderType === 'order') {
        blob = await reportService.generateOrderReport(orderId);
      } else {
        blob = await reportService.generateEcommerceReport(orderId);
      }

      const filename = `factura_${orderType}_${orderId}.pdf`;
      reportService.downloadPdf(blob, filename);
      
      toast.success('Reporte PDF generado y descargado exitosamente');
    } catch (error) {
      console.error('Error generating PDF report:', error);
      toast.error('Error al generar el reporte PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateOrderReport,
    isGenerating,
  };
}
