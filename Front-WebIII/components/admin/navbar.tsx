'use client';

import { useAuth } from '@/hooks/use-auth';
import { Bell, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { ecommerceService } from '@/lib/services/ecommerce.service';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Consulta global de órdenes
  const { data: ecommerceOrders = [], isFetching } = useQuery({
    queryKey: ['ecommerceOrders'],
    queryFn: () => ecommerceService.getOrdersByClient(''),
  });

  // Total de pendientes (se actualiza en tiempo real por React Query)
  const totalPendingOrders = ecommerceOrders.filter(o => o.status === 'Pendiente').length;

  return (
    <header className="flex h-16 items-center justify-between border-b navbar-bg px-6 shadow-sm text-foreground">
      {/* Información de usuario */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">
          Bienvenida {user?.role}, {user?.firstName}
        </h2>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-4">
        {/* Campanita con número de pendientes */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => router.push('/dashboard/ecommerce/pending-orders')} // ejemplo de ruta
        >
          <Bell className="h-5 w-5" />
          {totalPendingOrders > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {isFetching ? '...' : totalPendingOrders}
            </span>
          )}
        </Button>

        {/* Datos del usuario */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60">
            <User className="h-5 w-5 text-foreground/70" />
          </div>
          <div className="text-sm">
            <p className="font-medium">{user?.firstName}</p>
            <p className="text-xs text-foreground/70">{user?.email}</p>
          </div>
        </div>

        {/* Botón de logout (opcional) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            logout();
            router.push('/login');
          }}
        >
          <LogOut className="h-5 w-5 text-foreground/70" />
        </Button>
      </div>
    </header>
  );
}
