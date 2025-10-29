'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { ecommerceService } from '@/lib/services/ecommerce.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Package } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';

function CheckoutContent() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);

  // 🏢 Capturamos el nombre de empresa desde la URL (viene del carrito)
  const companyName = searchParams.get('company') || '';
  const queryClient = useQueryClient();

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {

      return await ecommerceService.createOrder(orderData);
    },
    onSuccess: () => {
      clearCart();
      toast.success('Pedido realizado con éxito ✅');
      queryClient.invalidateQueries({ queryKey: ['client-orders'] });

      router.push('/my-orders');
    },
    onError: (error: any) => {
      console.error('Error:', error);
      toast.error('No se pudo realizar el pedido, por favor intenta de nuevo.');
      setIsProcessing(false);
    },
  });

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Por favor, inicia sesión para realizar pedidos.');
      router.push('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Tu carrito está vacío.');
      router.push('/home');
      return;
    }

    setIsProcessing(true);

    // 📦 Datos del pedido (agregamos nameCompany si existe)
    const orderData = {
      clientId: user.id,
      nameClient: user.firstName ?? user.firstName ?? user.email,
      nameCompany: companyName || null, // 👈 si hay empresa, la incluimos
      total,
      status: 'Pendiente',
      ecommerceDetail: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subTotal: item.unitPrice! * item.quantity,
      })),
    };

    createOrderMutation.mutate(orderData);
  };

  // === UI ===
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg text-foreground/70 mb-4">
          Por favor, inicia sesión para completar tu compra
        </p>
        <Button onClick={() => router.push('/login')}>Iniciar sesión</Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg text-foreground/70 mb-4">Tu carrito está vacío</p>
        <Button onClick={() => router.push('/home')}>Seguir comprando</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Verificar pedido</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Información del usuario */}
          <Card>
            <CardHeader>
              <CardTitle>Información de compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">
                {user.firstName ?? user.firstName ?? user.email}
              </p>
              <p className="text-foreground/70">{user.email}</p>

              {/* 🏢 Mostrar empresa si existe */}
              {companyName && (
                <p className="text-primary font-medium mt-2">
                  Empresa de envío: {companyName}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Productos del pedido */}
          <Card>
            <CardHeader>
              <CardTitle>Productos del pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <Card key={item.productId} className="overflow-hidden">
                  <div className="flex">
                    {/* Imagen del producto */}
                    <div className="w-24 h-24 bg-gray-100 flex-shrink-0 flex items-center justify-center">
                      {item.product?.images && item.product.images.length > 0 ? (
                        (() => {
                          const img = item.product.images[0];
                          const url = typeof img === 'string' ? img : (img as any)?.url;
                          return url ? (
                            <img src={url} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : null;
                        })()
                      ) : (
                        <div className="text-gray-400 text-center">
                          <Package className="h-8 w-8 mx-auto mb-1" />
                          <div className="text-xs">Sin imagen</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Información del producto */}
                    <CardContent className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-lg mb-1">{item.product?.name}</h4>
                          <p className="text-sm text-foreground/80 mb-2">
                            Cantidad: {item.quantity} × Bs{Math.round(item.unitPrice)}
                          </p>
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div className="text-sm text-gray-500">
                          Subtotal
                        </div>
                        <p className="font-bold text-lg text-primary">
                          Bs{Math.round(item.unitPrice! * item.quantity)}
                        </p>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Resumen del pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                <div className="flex justify-between text-foreground/80">
                  <span>Subtotal</span>
                  <span>Bs{total}</span>
                </div>

                {/* Mostrar empresa si existe */}
                {companyName && (
                  <div className="flex justify-between text-foreground/80">
                    <span>Empresa de envío</span>
                    <span className="text-primary">{companyName}</span>
                  </div>
                )}

                {!companyName && (
                  <div className="flex justify-between text-slate-600">
                    <span></span>
                    <span></span>
                  </div>
                )}

                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">Bs{total}</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isProcessing}
              >
                {isProcessing ? 'Procesando...' : 'Realizar pedido'}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/cart')}
              >
                Volver al carrito
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
