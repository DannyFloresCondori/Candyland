'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/lib/services/product.service';
import { orderService, CreateOrderData } from '@/lib/services/order.service';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { Trash2, ShoppingCart } from 'lucide-react';
import { fetchData } from '@/services/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LIMIT = 3;

export default function ProductSalePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { items: cart, addItem, removeItem, clearCart, total } = useCart();

  const [formData, setFormData] = useState({ nameClient: '', nameCompany: '' });
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('Todos los productos');

  // 🔹 Categorías
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchData('categories'),
  });

  // 🔹 Productos filtrados por categoría y paginación
  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ['products', selectedCategory, page],
    queryFn: async () => {
      let products: any[] = [];

      if (selectedCategory === 'all') {
        const res = await productService.getAllProducts({ page, limit: LIMIT });
        products = res.data;
        return res;
      } else {
        const res = await productService.getProductsByCategoryId(selectedCategory);
        products = res.filter((p: any) => p.isActive || p.isAvailable);
        const startIndex = (page - 1) * LIMIT;
        const endIndex = startIndex + LIMIT;
        const paginatedProducts = products.slice(startIndex, endIndex);

        return {
          data: paginatedProducts,
          pagination: {
            page,
            limit: LIMIT,
            total: products.length,
            totalPages: Math.ceil(products.length / LIMIT),
            hasNextPage: endIndex < products.length,
            hasPrevPage: page > 1,
          },
        };
      }
    },
    placeholderData: (prev) => prev,
  });

  const products = productsResponse?.data || [];
  const pagination = productsResponse?.pagination;

  // ✅ Stock virtual basado en carrito
  const productsWithCartInfo = useMemo(() => {
    return products.map((p) => {
      const itemInCart = cart.find((c) => c.productId === p.id);
      return { ...p, virtualStock: p.stock - (itemInCart?.quantity || 0) };
    });
  }, [products, cart]);

  const handleAddToCart = async (product: any) => {
    if (product.virtualStock <= 0) {
      toast.error('Producto agotado');
      return;
    }
    await addItem(product.id, 1);
    toast.success(`${product.name} agregado al carrito`);
  };

  const handleRemoveFromCart = (productId: string) => removeItem(productId);

  const handleCancelPurchase = () => {
    if (cart.length === 0) return toast.info('No hay productos para cancelar.');
    clearCart();
    toast.success('🗑️ Compra cancelada');
  };

  const handleSubmit = () => {
    if (!user) return toast.error('Debes iniciar sesión');
    if (!formData.nameClient.trim()) return toast.error('Nombre del cliente obligatorio');
    if (cart.length === 0) return toast.error('No hay productos en el pedido');

    const orderData: CreateOrderData = {
      nameClient: formData.nameClient,
      nameCompany: formData.nameCompany || undefined,
      status: 'Vendido',
      total,
      userId: user.id,
      orderDetails: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    createOrderMutation.mutate(orderData);
  };

  const createOrderMutation = useMutation({
    mutationFn: (orderData: CreateOrderData) => orderService.createOrder(orderData),
    onSuccess: () => {
      toast.success('✅ Venta realizada correctamente - Order marcado como Vendido');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setFormData({ nameClient: '', nameCompany: '' });
      clearCart();
    },
    onError: () => toast.error('❌ Error al realizar la venta'),
  });

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
    if (categoryId === 'all') {
      setSelectedCategoryName('Todos los productos');
    } else {
      const found = categories.find((c: any) => c.id === categoryId);
      setSelectedCategoryName(found ? found.name : 'Productos');
    }
  };

  return (
    <div className="p-6 space-y-8">
  <h1 className="text-3xl font-bold text-primary">🛒 Punto de Venta</h1>
  <p className="text-foreground/80">Selecciona los productos para registrar una venta.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Sección Productos */}
        <div className="space-y-8">
          <Card className="shadow-lg border border-gray-200">
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-primary">Productos disponibles</h2>
              <Select
                value={selectedCategory}
                onValueChange={handleCategoryChange}
                disabled={categoriesLoading}
              >
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.filter((c: any) => c.isActive).map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-6 text-foreground/80">Cargando productos...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {productsWithCartInfo.map((product) => {
                    const availableStock = product.virtualStock;
                    return (
                      <div
                        key={product.id}
                        className={`border rounded-xl bg-white shadow-sm hover:shadow-md transition relative ${
                          availableStock === 0 ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      >
                        <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded-t-xl">
                          {product.images && product.images.length > 0 ? (
                            (() => {
                              const img = product.images[0];
                              const url = typeof img === 'string' ? img : (img as any)?.url;
                              return url ? (
                                <img src={url} alt={product.name} className="w-full h-full object-cover rounded-t-xl" />
                              ) : null;
                            })()
                          ) : (
                            <div className="text-gray-400 text-center">
                              <div className="text-4xl mb-2">📦</div>
                              <div className="text-sm">Sin imagen</div>
                            </div>
                          )}
                        </div>
                        <div className="p-4 space-y-2">
                          <h3 className="font-bold text-foreground truncate">{product.name}</h3>
                          {product.category && (
                            <p className="text-xs text-primary font-semibold uppercase">
                              {product.category.name}
                            </p>
                          )}
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-lg font-semibold text-primary">BOB {product.price}</span>
                            <span className={`text-xs font-medium ${availableStock > 0 ? 'text-gray-600' : 'text-red-500'}`}>
                              {availableStock > 0 ? `Stock: ${availableStock}` : 'Agotado'}
                            </span>
                          </div>
                        </div>
                        <CardFooter className="p-3">
                          <Button
                            onClick={() => handleAddToCart(product)}
                            disabled={availableStock === 0}
                            className="w-full"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Agregar
                          </Button>
                        </CardFooter>
                      </div>
                    );
                  })}
                </div>
              )}
              {pagination && (
                <PaginationControls pagination={pagination} onPageChange={setPage} className="mt-6" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Carrito */}
        <Card className="shadow-lg border border-gray-200">
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              Carrito de venta
            </h2>
            {cart.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleCancelPurchase} className="bg-red-500 hover:bg-red-600 text-white">
                Cancelar compra
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-foreground/80 text-center py-10">No hay productos agregados.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {cart.map((item) => (
                  <div key={item.productId} className="flex flex-col items-center border rounded-md p-2 shadow-sm">
                    <div className="w-full h-24 mb-2 bg-gray-100 rounded-md flex items-center justify-center">
                        {item.product.images && item.product.images.length > 0 ? (
                          (() => {
                            const img = item.product.images[0];
                            const url = typeof img === 'string' ? img : (img as any)?.url;
                            return url ? (
                              <img src={url} alt={item.product.name} className="w-full h-full object-cover rounded-md" />
                            ) : null;
                          })()
                        ) : (
                        <div className="text-gray-400 text-center">
                          <div className="text-2xl">📦</div>
                        </div>
                      )}
                    </div>
                    <p className="font-medium text-gray-800 text-center truncate">{item.product.name}</p>
                    <p className="text-sm text-foreground/80">{item.quantity} × BOB {item.unitPrice} = <span className="font-semibold text-foreground">BOB {item.subTotal}</span></p>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveFromCart(item.productId)} className="hover:bg-red-50 mt-1">
                      <Trash2 className="h-5 w-5 text-red-500 hover:text-red-700" />
                    </Button>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-lg mt-4 border-t pt-3 col-span-2">
                  <span>Total:</span>
                  <span className="text-primary">BOB {total}</span>
                </div>
              </div>
            )}
            {/* Nombre del cliente debajo */}
            <div className="mt-4">
              <Input
                placeholder="Nombre del cliente"
                value={formData.nameClient}
                onChange={(e) => setFormData({ ...formData, nameClient: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter>
            {cart.length > 0 && (
              <Button 
                onClick={handleSubmit}
                disabled={createOrderMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {createOrderMutation.isPending ? 'Procesando...' : 'Realizar Venta'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
