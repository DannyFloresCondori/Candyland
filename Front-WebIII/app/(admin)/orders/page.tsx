'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService, Order } from '@/lib/services/order.service';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { X, Check } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { toast } from 'sonner';

export default function OrdersPage() {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getAllOrders(),
  });

  // Mutación para rechazar
  const rejectMutation = useMutation({
    mutationFn: (id: string) => orderService.rejectOrder(id),
    onSuccess: () => {
      toast.success('Order Rechazado Correctamente');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: () => {
      toast.error('Falla en rechazar');
    },
  });

  // Mutación para marcar como vendido
  const soldMutation = useMutation({
    mutationFn: (id: string) => orderService.markAsSold(id), // <-- necesitas crear este método en orderService
    onSuccess: () => {
      toast.success('Orden marcado como vendido');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: () => {
      toast.error('Fallo en el sistema para vender');
    },
  });

  const todayOrders = orders.filter((order) =>
    isSameDay(new Date(order.createdAt), new Date())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Todos los Pedidos</h1>
        <p className="text-slate-600">
          Ver y administrar los pedidos realizados hoy</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todayOrders.map((order: Order, index: number) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    #{index + 1} {/* Aquí se numera consecutivamente */}
                  </TableCell>
                  <TableCell>{order.nameClient || '-'}</TableCell>
                  <TableCell>${order.total?.toFixed(0) || '0.00'}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${order.status === 'Vendido'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                    >
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)! || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-green-500 text-white hover:bg-green-600"
                      onClick={() => soldMutation.mutate(order.id)}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Vendido
                    </Button>

                    <Button variant="destructive" onClick={() => rejectMutation.mutate(order.id)}>Rechazar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </div>
      )}
    </div>
  );
}
