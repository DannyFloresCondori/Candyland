'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Package, Trash2, Minus, Plus, ShoppingCart } from 'lucide-react';

export default function CartPage() {

  const { items, updateQuantity, removeItem, total, itemCount } = useCart();
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState(''); // ← input controlado para nombre de empresa
  

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <ShoppingCart className="h-24 w-24 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Tu carrito está vacío</h2>
        <p className="text-foreground/70 mb-6">
          Añade algunos productos para comenzar
        </p>
        <Link href="/home">
          <Button>Continuar comprando</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Carrito de Compra</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 🛒 Lista de productos */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.productId} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex">
                {/* Imagen del producto */}
                <div className="w-24 h-24 bg-gray-100 flex-shrink-0 flex items-center justify-center">
                  {item.product?.images && item.product.images.length > 0 ? (
                    <img
                      src={typeof item.product.images[0] === 'string' 
                        ? item.product.images[0] 
                        : item.product.images[0].url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
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
                    <Link href={`/product/${item.productId}`}>
                      <h3 className="font-semibold text-lg hover:text-primary mb-1">
                        {item.product?.name}
                      </h3>
                    </Link>
                    <p className="text-foreground/80 text-sm mb-3">
                      Bs{Math.round(item.unitPrice)} Precio unitario
                    </p>
                  </div>
                  
                  {/* Controles de cantidad y acciones */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                      id='rest'
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (val > 0) updateQuantity(item.productId, val);
                        }}
                        className="w-16 h-8 text-center"
                        min={1}
                      />

                      <Button
                      id='sum'
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm text-foreground/80">Subtotal</p>
                        <p className="font-bold text-lg text-primary">
                          Bs{Math.round(item.unitPrice! * item.quantity)}
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {/* 🧾 Resumen de compra */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold">Resumen de compra</h2>

                <div className="space-y-2">
                <div className="flex justify-between text-foreground/80">
                  <span>Productos ({itemCount})</span>
                  <span>Bs{total}</span>
                </div>

                {/* Envío o empresa */}
                <div className="justify-items-start text-slate-600">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">¿Enviar a una empresa?</h3>
                    <Input
                      placeholder="Nombre de la empresa"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      Empresa de Destino(opcional).
                    </p>
                  </CardContent>
                  {companyName ? (
                    <span className="font-medium text-primary">{companyName}</span>
                  ) : (
                    <span></span>
                  )}
                </div>

                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">Bs{total}</span>
                  </div>
                </div>
              </div>

              <Link
                href={{
                  pathname: '/checkout',
                  query: companyName ? { company: companyName } : {},
                }}
              >
                <Button className="w-full" size="lg">
                  Pasar por caja
                </Button>
              </Link>

              <Link href="/home">
                <Button variant="outline" className="w-full">
                  Continuar comprando
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
