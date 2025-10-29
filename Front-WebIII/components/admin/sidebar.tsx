'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  ShoppingCart,
  LogOut,
  Banknote,
} from 'lucide-react';
import { FaGlobe } from 'react-icons/fa';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { ecommerceService } from '@/lib/services/ecommerce.service';

// Menú lateral principal
const menuItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Vender', href: '/productSale', icon: Banknote },
  { title: 'Productos', href: '/products', icon: Package },
  { title: 'Categorias', href: '/categories', icon: FolderTree },
  { title: 'Clientes', href: '/clients', icon: Users },
  {
    title: 'Pedidos',
    icon: ShoppingCart,
    subItems: [
      { title: 'Vendidas', href: '/orders/desktop/sold' },
      {
        title: 'Pedidos en línea',
        icon: FaGlobe,
        subItems: [
          { title: 'Vendidas', href: '/orders/ecommerce/soldEcommerce' },
          { title: 'Pendientes', href: '/orders/ecommerce/pendingEcommerce' },
          { title: 'Rechazadas', href: '/orders/ecommerce/rejectedEcommerce' },
        ],
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  // 🔹 Traer todas las órdenes de ecommerce (React Query cache compartida)
  const { data: ecommerceOrders = [], isFetching } = useQuery({
    queryKey: ['ecommerceOrders'],
    queryFn: () => ecommerceService.getOrdersByClient(''),
  });

  // 🔹 Contar solo las pendientes (se actualiza automáticamente)
  const pendingCount = ecommerceOrders.filter(o => o.status === 'Pendiente').length;

  // 🔹 Renderizado recursivo de los ítems del menú
  const renderMenuItem = (item: any, level = 0) => {
    const padding = level * 6;
    const isActive = item.href ? pathname === item.href : false;

    // 🔸 Caso con submenús
    if (item.subItems) {
      return (
        <div key={item.title} className="space-y-1">
          <div
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300',
              isActive && 'bg-slate-800 text-white',
              (item.title === 'Pedidos' || item.title === 'Pedidos en línea') &&
                'border-b border-slate-700'
            )}
            style={{ paddingLeft: `${padding}px` }}
          >
            {item.icon && <item.icon className="h-5 w-5" />}
            {item.title}

            {/* 🔹 Mostrar contador al lado del grupo "Pedidos en línea" */}
            {item.title === 'Pedidos en línea' && pendingCount > 0 && (
              <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-red-600 text-white">
                {isFetching ? '...' : pendingCount}
              </span>
            )}
          </div>

          {/* Submenú */}
          <div className="flex flex-col space-y-1">
            {item.subItems.map((sub: any) => renderMenuItem(sub, level + 1))}
          </div>
        </div>
      );
    }

    // 🔸 Caso enlace normal
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-slate-800 text-white'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        )}
        style={{ paddingLeft: `${padding}px` }}
      >
        {item.icon && <item.icon className="h-5 w-5" />}
        {item.title}

        {/* 🔹 Contador solo para el subitem "Pendientes" */}
        {item.title === 'Pendientes' && pendingCount > 0 && (
          <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-red-600 text-white">
            {isFetching ? '...' : pendingCount}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="flex h-16 items-center justify-center border-b border-slate-800">
        <h1 className="text-xl font-bold">Candyland Admin</h1>
      </div>

      {/* Menú */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-800 p-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
