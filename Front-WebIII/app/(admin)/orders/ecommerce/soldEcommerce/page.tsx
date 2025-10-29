'use client';

import { useQuery } from '@tanstack/react-query';
import { ecommerceService, EcommerceOrder, EcommerceDetail } from '@/lib/services/ecommerce.service';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { useState } from 'react';
import { usePdfReport } from '@/hooks/use-pdf-report';
import { FileText } from 'lucide-react';

export default function EcommerceOrdersPage() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['ecommerceOrders'],
    queryFn: () => ecommerceService.getOrdersByClient(''),
  });

  const { generateOrderReport, isGenerating } = usePdfReport();

  const soldOrders = orders
    .filter(order => order.status === 'Vendido')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const [selectedOrder, setSelectedOrder] = useState<EcommerceOrder | null>(null);

  const groupedOrders: Record<string, EcommerceOrder[]> = soldOrders.reduce((acc, order) => {
    const dayKey = format(new Date(order.createdAt), 'dd/MM/yyyy');
    if (!acc[dayKey]) acc[dayKey] = [];
    acc[dayKey].push(order);
    return acc;
  }, {} as Record<string, EcommerceOrder[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ventas Ecommerce</h1>
        <p className="text-slate-600">Ver todas las órdenes vendidas de ecommerce, agrupadas por día</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : (
        Object.entries(groupedOrders).map(([day, orders]) => {
          const totalDia = orders.reduce((sum, o) => sum + (o.total || 0), 0);

          return (
            <div key={day} className="rounded-lg border bg-white overflow-hidden">
              <div className="bg-green-600 text-white p-3 font-semibold flex justify-between items-center">
                <span>📅 Ventas del {day}</span>
                <span>Total del día: Bs{totalDia.toFixed(0)}</span>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Nro Celular</TableHead>
                    <TableHead className="text-right">Detalle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: EcommerceOrder, index: number) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{index + 1}</TableCell>
                      <TableCell>{order.nameClient || '-'}</TableCell>
                      <TableCell>Bs{order.total?.toFixed(0)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>{order.client?.address || '-'}</TableCell>
                      <TableCell>{order.client?.phone || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="default" size="sm" onClick={() => setSelectedOrder(order)}>
                            Ver Detalle
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => generateOrderReport(order.id, 'ecommerce')}
                            disabled={isGenerating}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="bg-slate-100 text-slate-700 text-sm px-4 py-2 border-t text-center">
                Día terminado — Total ganado: <strong>Bs{totalDia.toFixed(0)}</strong>
              </div>
            </div>
          );
        })
      )}

      {/* Modal Detalle */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
            <h2 className="text-2xl font-bold mb-4">Detalle de la venta Ecommerce</h2>

            <div className="mb-4 space-y-1">
              <p><strong>Order ID:</strong> {selectedOrder.id}</p>
              <p><strong>Cliente:</strong> {selectedOrder.nameClient}</p>
              {selectedOrder.nameCompany && <p><strong>Empresa:</strong> {selectedOrder.nameCompany}</p>}
              <p><strong>Dirección:</strong> {selectedOrder.client?.address || '-'}</p>
              <p><strong>Celular:</strong> {selectedOrder.client?.phone || '-'}</p>
              <p><strong>Fecha:</strong> {format(new Date(selectedOrder.createdAt), 'dd/MM/yyyy')}</p>
              <p><strong>Hora:</strong> {format(new Date(selectedOrder.createdAt), 'HH:mm')}</p>
            </div>

            <h3 className="text-xl font-semibold mb-2">Productos:</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedOrder.ecommerceDetail.map((detail: EcommerceDetail) => (
                <div key={detail.id} className="flex items-center gap-4 border-b py-2">
                  {detail.product?.images?.[0] && (
                    (() => {
                      const img = detail.product.images[0];
                      const url = typeof img === 'string' ? img : (img as any)?.url;
                      return url ? <img src={url} alt={detail.product.name} className="h-12 w-12 object-cover rounded" /> : null;
                    })()
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{detail.product?.name}</p>
                    <p className="text-sm text-slate-600">Bs{detail.unitPrice?.toFixed(0)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">x{detail.quantity}</p>
                    <p className="text-sm text-slate-600">Subtotal: Bs{detail.subTotal?.toFixed(0)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-right">
              <p className="text-lg font-bold">Total: Bs{selectedOrder.total?.toFixed(0)}</p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => generateOrderReport(selectedOrder.id, 'ecommerce')}
                disabled={isGenerating}
              >
                <FileText className="h-4 w-4 mr-1" />
                Generar PDF
              </Button>
              <Button variant="destructive" onClick={() => setSelectedOrder(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
