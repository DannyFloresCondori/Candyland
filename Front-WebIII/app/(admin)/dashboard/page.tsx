'use client';

import { useQuery } from '@tanstack/react-query';
import { orderService, Order } from '@/lib/services/order.service';
import { ecommerceService, EcommerceOrder } from '@/lib/services/ecommerce.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import Image from 'next/image';
import ImageLogo from '../../../img/Logo.jpeg'

// Datos de ejemplo para gráficos
const mockChartData = [
  { name: 'Lu', sales: 4000 },
  { name: 'Ma', sales: 3000 },
  { name: 'Mi', sales: 2000 },
  { name: 'Ju', sales: 2780 },
  { name: 'Vi', sales: 1890 },
  { name: 'Sa', sales: 2390 },
  { name: 'Do', sales: 3490 },
];

export default function DashboardPage() {
  // 🔹 Traer orders tradicionales
  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getAllOrders(),
  });

  // 🔹 Traer ecommerce orders
  const { data: ecommerceOrders = [], isLoading: loadingEcom } = useQuery({
    queryKey: ['ecommerceOrders'],
    queryFn: () => ecommerceService.getOrdersByClient(''), // o '' si quieres todos
  });

  const isLoading = loadingOrders || loadingEcom;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  // 🔹 Función auxiliar para filtrar ventas vendidas y calcular total
  const calcTotal = (items: (Order | EcommerceOrder)[], filterDate?: Date) => {
    return items
      .filter(i => i.status === 'Vendido')
      .filter(i => !filterDate || new Date(i.createdAt).toDateString() === filterDate.toDateString())
      .reduce((sum, i) => sum + (i.total || 0), 0);
  };

  const today = new Date();
  const totalVentasHoy = calcTotal(orders, today) + calcTotal(ecommerceOrders, today);
  const totalVentasMes =
    calcTotal(orders.filter(o => new Date(o.createdAt).getMonth() === today.getMonth())) +
    calcTotal(ecommerceOrders.filter(o => new Date(o.createdAt).getMonth() === today.getMonth()));

  // Calcular ventas por tipo para hoy
  const ventasOrdersHoy = calcTotal(orders, today);
  const ventasEcommerceHoy = calcTotal(ecommerceOrders, today);

  // Calcular ventas por tipo para el mes
  const ventasOrdersMes = calcTotal(orders.filter(o => new Date(o.createdAt).getMonth() === today.getMonth()));
  const ventasEcommerceMes = calcTotal(ecommerceOrders.filter(o => new Date(o.createdAt).getMonth() === today.getMonth()));

  const pedidosPendientes =
    ecommerceOrders.filter(o => o.status === 'Pendiente').length;

  const pedidosRechazados =
    ecommerceOrders.filter(o => o.status === 'Rechazado').length;

  const statCards = [
    {
      title: 'Ventas Hoy',
      value: `Bs${totalVentasHoy.toFixed(0)}`,
      subtitle: `Venta Local: Bs${ventasOrdersHoy.toFixed(0)} | Venta Linea: Bs${ventasEcommerceHoy.toFixed(0)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Ventas Este Mes',
      value: `Bs${totalVentasMes.toFixed(0)}`,
      subtitle: `Venta Local: Bs${ventasOrdersMes.toFixed(0)} | Venta Linea: Bs${ventasEcommerceMes.toFixed(0)}`,
      icon: DollarSign,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    { title: 'Pedidos Pendientes', value: pedidosPendientes, icon: ShoppingCart, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    { title: 'Pedidos Rechazados', value: pedidosRechazados, icon: ShoppingCart, color: 'text-red-600', bgColor: 'bg-red-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center">
          <Image
            src={ImageLogo}
            alt="Helados Candyland"
            width={150}
            height={150}
            className="object-contain rounded-[30px]"
          />
        </div>
        <p className="text-slate-600">Resumen rápido de tu tienda</p>
      </div>

      {/* 🔹 Tarjetas de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-foreground/80">{stat.title}</CardTitle>
                <div className={`rounded-full p-2 ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.subtitle && (
                  <div className="text-xs text-foreground/70 mt-1">{stat.subtitle}</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 🔹 Gráfico de ejemplo */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas Semanales</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
}
