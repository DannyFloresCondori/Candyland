'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { toast } from 'sonner';
import { usePdfReport } from '@/hooks/use-pdf-report';
import { FileText } from 'lucide-react';

export default function PendingEcommerceOrdersPage() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<EcommerceOrder | null>(null);
  const { generateOrderReport, isGenerating } = usePdfReport();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['ecommerceOrders'],
    queryFn: () => ecommerceService.getOrdersByClient(''),
  });

  const pendingOrders = orders
    .filter(order => order.status === 'Pendiente')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Mutación para rechazar
  const rejectMutation = useMutation({
    mutationFn: (id: string) => ecommerceService.rejectOrder(id),
    onSuccess: () => {
      toast.success('Orden rechazada');
      queryClient.invalidateQueries({ queryKey: ['ecommerceOrders'] });
      setSelectedOrder(null);
    },
    onError: () => toast.error('Error al rechazar la orden'),
  });

  // Mutación para marcar como vendido
  const soldMutation = useMutation({
    mutationFn: (id: string) => ecommerceService.markAsSold(id),
    onSuccess: () => {
      toast.success('Orden vendida');
      queryClient.invalidateQueries({ queryKey: ['ecommerceOrders'] });
      setSelectedOrder(null);
    },
    onError: () => toast.error('Error al vender la orden'),
  });

  // Agrupar por día
  const groupedOrders: Record<string, EcommerceOrder[]> = pendingOrders.reduce((acc, order) => {
    const dayKey = format(new Date(order.createdAt), 'dd/MM/yyyy');
    if (!acc[dayKey]) acc[dayKey] = [];
    acc[dayKey].push(order);
    return acc;
  }, {} as Record<string, EcommerceOrder[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Órdenes Pendientes Ecommerce</h1>
        <p className="text-slate-600">Ver y administrar las órdenes pendientes</p>
        <div className="mt-2">
          <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
            Total de órdenes pendientes: {pendingOrders.length}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : pendingOrders.length === 0 ? (
        <p className="text-center text-slate-500">No hay órdenes pendientes.</p>
      ) : (
        Object.entries(groupedOrders).map(([day, orders]) => {
          const totalDia = orders.reduce((sum, o) => sum + (o.total || 0), 0);

          return (
            <div key={day} className="rounded-lg border bg-white overflow-hidden">
              <div className="bg-yellow-500 text-white p-3 font-semibold flex justify-between items-center">
                <span>📅 Órdenes pendientes del {day}</span>
                <span>Total del día: Bs{totalDia.toFixed(0)}</span>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Nro Celular</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: EcommerceOrder, index: number) => {
                    const date = new Date(order.createdAt);
                    const formattedDate = format(date, 'dd/MM/yyyy');
                    const formattedTime = format(date, 'HH:mm');

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{index + 1}</TableCell>
                        <TableCell>{order.nameClient || '-'}</TableCell>
                        <TableCell>Bs{order.total?.toFixed(0)}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700">
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell>{order.client?.address || '-'}</TableCell>
                      <TableCell>{order.client?.phone || '-'}</TableCell>
                        <TableCell className="text-right flex justify-end gap-2">
                          <Button variant="default" size="sm" onClick={() => setSelectedOrder(order)}>
                            Ver Detalle
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => rejectMutation.mutate(order.id)}>
                            Rechazar
                          </Button>
                          <Button size="sm" className="bg-green-500 text-white hover:bg-green-600" onClick={() => soldMutation.mutate(order.id)}>
                            Vender
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="bg-slate-100 text-slate-700 text-sm px-4 py-2 border-t text-center">
                Día terminado — Total pendiente: <strong>Bs{totalDia.toFixed(0)}</strong>
              </div>
            </div>
          );
        })
      )}

      {/* Modal Detalle */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
            <h2 className="text-2xl font-bold mb-4">Detalle de la orden pendiente</h2>

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
                    <img 
                      src={typeof detail.product.images[0] === 'string' 
                        ? detail.product.images[0] 
                        : detail.product.images[0].url} 
                      alt={detail.product.name} 
                      className="h-12 w-12 object-cover rounded" 
                    />
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
              <Button variant="destructive" onClick={() => setSelectedOrder(null)}>Cerrar</Button>
              <Button className="bg-green-500 text-white hover:bg-green-600" onClick={() => soldMutation.mutate(selectedOrder.id)}>Vender</Button>
              <Button variant="destructive" onClick={() => rejectMutation.mutate(selectedOrder.id)}>Rechazar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
