'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShoppingCart, Package } from 'lucide-react';
import { toast } from 'sonner';
import { productService } from '@/lib/services/product.service';
import { fetchData } from '@/services/api';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { ProductImages } from '@/components/ui/product-image';

const LIMIT = 8;

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('Todos los productos');
  const [page, setPage] = useState<number>(1);
  const { addItem, items: cart } = useCart();

  // 🔹 Productos según categoría y página
  const { data: productsResponse, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products', selectedCategory, page],
    queryFn: async () => {
      if (selectedCategory === 'all') {
        return await productService.getAllProducts({ page, limit: LIMIT });
      }
      const res = await productService.getProductsByCategoryId(selectedCategory);
      // Simulación de paginación en frontend
      const filteredProducts = res.filter((p: any) => p.isActive || p.isAvailable);
      const startIndex = (page - 1) * LIMIT;
      const endIndex = startIndex + LIMIT;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      return {
        data: paginatedProducts,
        pagination: {
          page,
          limit: LIMIT,
          total: filteredProducts.length,
          totalPages: Math.ceil(filteredProducts.length / LIMIT),
          hasNextPage: endIndex < filteredProducts.length,
          hasPrevPage: page > 1,
        },
      };
    },
    placeholderData: (previousData) => previousData,
  });

  const products = productsResponse?.data || [];
  const pagination = productsResponse?.pagination;

  // 🔹 Categorías
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchData('categories'),
  });

  // ✅ Stock virtual basado en carrito
  const productsWithVirtualStock = useMemo(() => {
    return products.map((product: any) => {
      const itemInCart = cart.find((c: any) => c.productId === product.id);
      const virtualStock = product.stock - (itemInCart?.quantity || 0);
      return { ...product, virtualStock };
    });
  }, [products, cart]);

  const handleAddToCart = async (product: any) => {
    if (product.virtualStock <= 0) {
      toast.error(`No hay más stock disponible de ${product.name}`);
      return;
    }
    await addItem(product.id, 1);
    toast.success(`${product.name} agregado al carrito`);
  };

  const activeProducts = productsWithVirtualStock.filter((p: any) => p.isAvailable || p.isActive);

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

  // 🔹 Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Bienvenido a Candyland 🍭</h1>
          <p className="text-foreground/80 mt-2">Descubre nuestra deliciosa colección de dulces</p>
        </div>
        <div className="w-64">
          <Select value={selectedCategory} onValueChange={handleCategoryChange} disabled={categoriesLoading}>
            <SelectTrigger>
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
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-primary mt-4">
        Mostrando: {selectedCategoryName}
      </h2>

      {/* Productos */}
      {productsLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : productsError ? (
        <p className="text-red-500">Error cargando productos.</p>
      ) : activeProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-foreground/80">
          <Package className="h-16 w-16 mb-4" />
          <p className="text-lg">No hay productos disponibles</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {activeProducts.map((product: any) => {
              const isOutOfStock = product.virtualStock <= 0;

              return (
                <Card
                  key={product.id}
                  className={`overflow-hidden relative transition ${isOutOfStock
                      ? 'opacity-60 cursor-[url("/icons/blocked-cursor.png"),_not-allowed]'
                      : 'cursor-pointer hover:shadow-lg hover:scale-[1.02]'
                    }`}
                >
                  {/* Imagen del producto */}
                  <div className="flex items-center justify-center bg-slate-100 h-56 relative">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <ProductImages
                        images={product.images || []}
                        alt={product.name}
                        className="object-contain w-full h-full"
                        maxVisible={1}
                      />
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-sm text-foreground/80 line-clamp-2 mt-1">
                      {product.description || 'Sin descripción'}
                    </p>
                    <p className="text-xs text-primary/80 mt-1">
                      {product.category?.name || 'Sin categoría'}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        BOB {Math.round(product.price)}
                      </span>
                      <span
                        className={`text-sm ${product.virtualStock <= 2 ? 'text-red-500' : 'text-slate-500'
                          }`}
                      >
                        Stock: {Math.max(product.virtualStock, 0)}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0">
                    <Button
                      id='cart'
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={isOutOfStock}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4 hover:bg-slate-600" />
                      {isOutOfStock ? 'Sin Producto' : 'Agregar al carrito'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Paginación */}
          {pagination && (
            <PaginationControls
              pagination={pagination}
              onPageChange={handlePageChange}
              className="mt-6"
            />
          )}
        </>
      )}
    </div>
  );
}
