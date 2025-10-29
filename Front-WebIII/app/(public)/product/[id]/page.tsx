'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ecommerceService, EcommerceDetail } from '@/lib/services/ecommerce.service';
import { productService } from '@/lib/services/product.service';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Package, ArrowLeft, ShoppingCart, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const router = useRouter();

  // 🔹 Obtener producto por ID
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', params.id],
    queryFn: () => productService.getProductById(params.id),
  });

  // 🔹 Productos relacionados (misma categoría)
  const { data: relatedProducts = [], isLoading: loadingRelated } = useQuery({
    queryKey: ['productsByCategory', product?.categoryId],
    queryFn: () =>
      product?.categoryId
        ? productService.getProductsByCategoryId(product.categoryId)
        : Promise.resolve([]),
    enabled: !!product?.categoryId,
  });

  const handleAddToCart = async () => {
    if (!product) return;

    // Construimos el objeto EcommerceDetail compatible con tu servicio
    const newItem: EcommerceDetail = {
      id: crypto.randomUUID(),
      productId: product.id,
      quantity,
      unitPrice: product.price,
      subTotal: product.price * quantity,
      product: { name: product.name, images: product.images ?? [] },
    };

    await addItem(product.id, quantity); // ya usa useCart
    toast.success(`${product.name} added to cart`);
    router.push('/cart');
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) setQuantity(quantity + 1);
  };
  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg text-slate-600">Product not found</p>
        <Link href="/home">
          <Button className="mt-4">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/home">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </Link>

      {/* Detalle principal */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="overflow-hidden">
    <div className="aspect-square bg-muted/50 flex items-center justify-center">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Package className="h-32 w-32 text-slate-400" />
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold">{product.name}</h1>
            {product.categoryId && (
              <p className="text-lg text-foreground/80 mt-2">
                Category ID: {product.categoryId}
              </p>
            )}
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-bold text-primary">
              ${product.price}
            </span>
            <span
              className={`text-lg ${
                product.stock > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

            {product.description && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-foreground/80">{product.description}</p>
            </div>
          )}

          {product.stock > 0 && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Quantity</label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val > 0 && val <= product.stock) setQuantity(val);
                      }}
                      className="w-20 text-center"
                      min={1}
                      max={product.stock}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart - ${(product.price * quantity).toFixed(2)}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Productos relacionados */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">More from this category</h2>

        {loadingRelated ? (
          <p className="text-slate-500">Loading related products...</p>
        ) : relatedProducts.length === 0 ? (
          <p className="text-slate-500">No related products found.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {relatedProducts
              .filter((p) => p.id !== product.id)
              .map((related) => (
                <Link
                  key={related.id}
                  href={`/products/${related.id}`}
                  className="block"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-slate-100 flex items-center justify-center">
                      {related.images?.[0] ? (
                        <img
                          src={related.images[0]}
                          alt={related.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-20 w-20 text-slate-400" />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold truncate">{related.name}</h3>
                      <p className="text-primary font-medium">
                        ${related.price.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
