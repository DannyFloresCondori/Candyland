'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { ecommerceService } from '@/lib/services/ecommerce.service';
import { es } from 'date-fns/locale'; // 🇪🇸 para formato en español

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 🔐 Redirigir al login si no hay usuario
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 📦 Obtener pedidos del cliente logueado
  const { data: ecommerces = [], isLoading } = useQuery({
    queryKey: ['client-orders'],
    queryFn: () => ecommerceService.getOrdersByClient(user!.id),
    enabled: !!user,
  });

  if (loading || !user) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  // 🔄 Ordenar pedidos de más reciente a más antiguo
  const sortedOrders = [...ecommerces].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Mis pedidos</h1>
      {sortedOrders.length > 0 && (
        <p className="text-foreground/70 mb-6">
          Tienes <span className="font-semibold">{sortedOrders.length}</span> pedido
          {sortedOrders.length > 1 ? 's' : ''} realizado
          {sortedOrders.length > 1 ? 's' : ''}.
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : sortedOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Package className="h-24 w-24 text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No hay pedidos aún</h2>
          <p className="text-slate-600">Comienza a comprar para crear tu primer pedido</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map((ecommerce, index) => (
            <Card key={ecommerce.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  {/* 🔹 Enumeración en orden descendente */}
                  <CardTitle className="text-lg">
                    Pedido #{index + 1}
                  </CardTitle>

                  {/* 🏢 Empresa si existe */}
                  {ecommerce.nameCompany && (
                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                      <span className="font-medium">Lugar de Envío</span>
                      <Building2 className="w-4 h-4 text-primary" />
                      <span className="font-medium">{ecommerce.nameCompany}</span>
                    </div>
                  )}
                </div>

                {/* 📅 Fecha + hora */}
                <p className="text-sm text-foreground/80">
                  {format(new Date(ecommerce.createdAt), "dd 'de' MMMM yyyy 'a las' HH:mm", { locale: es })}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {ecommerce.ecommerceDetail?.map((detail) => (
                  <div
                    key={detail.id}
                    className="flex items-center justify-between pb-4 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{detail.product?.name || 'Producto'}</p>
                      <p className="text-sm text-slate-600">
                        Cantidad: {detail.quantity} × Bs{Math.round(detail.unitPrice!)}
                      </p>
                    </div>
                    <p className="font-bold">Bs{Math.round(detail.subTotal!)}</p>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg text-primary">Bs{Math.round(ecommerce.total!)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
