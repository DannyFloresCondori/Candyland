'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/lib/services/product.service';
import { categoryService } from '@/lib/services/category.service';
import { fileService } from '@/lib/services/file.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, ImagePlus } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { CreateProductImage } from '@/hooks/use-cart';

const LIMIT = 4;

// 🔹 Validación
const productSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'El precio debe ser positivo'),
  stock: z.coerce.number().int().min(0, 'El stock debe ser positivo'),
  images: z
    .array(z.object({ url: z.string().url('Debe ser una URL válida') }))
    .optional(), // ⚠️ No tocar editingProduct aquí
  isAvailable: z.boolean(),
  categoryId: z.string().min(1, 'Debe seleccionar una categoría'),
});


type ProductFormData = z.infer<typeof productSchema>;

export default function ProductsPage() {
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const queryClient = useQueryClient();

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // 🔹 Obtener categorías
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
  });

  // 🔹 Obtener productos
  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ['products', selectedCategory, page],
    queryFn: async () => {
      if (selectedCategory === 'all') {
        return await productService.getAllProducts({ page, limit: LIMIT });
      }
      const res = await productService.getProductsByCategoryId(selectedCategory);
      const startIndex = (page - 1) * LIMIT;
      const endIndex = startIndex + LIMIT;
      const paginated = res.slice(startIndex, endIndex);
      return {
        data: paginated,
        pagination: {
          page,
          limit: LIMIT,
          total: res.length,
          totalPages: Math.ceil(res.length / LIMIT),
          hasNextPage: endIndex < res.length,
          hasPrevPage: page > 1,
        },
      };
    },
    placeholderData: (previousData) => previousData,
  });

  const products = productsResponse?.data || [];
  const pagination = productsResponse?.pagination;

  // 🔹 Formulario
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      images: [],
      isAvailable: true,
      categoryId: '',
    },
  });

  // 🔹 Subir imágenes y crear producto
  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      let imageUrls: string[] = [];

      if (imageFiles.length > 0) {
        imageUrls = await fileService.uploadMultipleFiles(imageFiles);
      }

      return await productService.createProduct({
        ...data,
        images: imageUrls.map(url => ({ url }) as CreateProductImage),
      });
    },
    onSuccess: () => {
      toast.success('Producto creado');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      handleClose();
    },
    onError: (err: any) => toast.error(err.message),
  });

  // 🔹 Actualizar producto
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductFormData }) => {
      let imageUrls: string[] = [];

      if (imageFiles.length > 0) {
        imageUrls = await fileService.uploadMultipleFiles(imageFiles);
      }

      return await productService.updateProduct(id, {
        ...data,
        images: imageUrls.map(url => ({ url }) as CreateProductImage),
      });
    },
    onSuccess: () => {
      toast.success('Producto actualizado');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      handleClose();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      toast.success('Producto eliminado');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => toast.error('Error al eliminar'),
  });

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setValue('name', product.name);
    setValue('description', product.description || '');
    setValue('price', product.price);
    setValue('stock', product.stock);
    setValue('isAvailable', product.isAvailable);
    setValue('categoryId', product.categoryId);
    setImageFiles([]);
    setPreviewUrls(product.images?.map((img: any) => img.url) || []);
    setOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setImageFiles(files);

    const urls = files.map((file) => fileService.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProduct(null);
    setImageFiles([]);
    setPreviewUrls([]);
    reset();
  };

  const onSubmit = (data: ProductFormData) => {
    if (!editingProduct && imageFiles.length === 0) {
      toast.error('Debe seleccionar al menos una imagen');
      return;
    }

    if (editingProduct) updateMutation.mutate({ id: editingProduct.id, data });
    else createMutation.mutate(data);
  };


  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-slate-600">Administra el inventario</p>
        </div>

        <div className="flex items-center gap-3">
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
              {categories.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nuevo producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Editar producto' : 'Crear producto'}
                </DialogTitle>
              </DialogHeader>

              {/* Formulario */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre</Label>
                    <Input {...register('name')} />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Categoría</Label>
                    <Controller
                      name="categoryId"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c: any) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.categoryId && (
                      <p className="text-sm text-red-500 mt-1">{errors.categoryId.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Descripción</Label>
                  <Textarea {...register('description')} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Precio</Label>
                    <Input type="number" {...register('price')} />
                    {errors.price && (
                      <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Stock</Label>
                    <Input type="number" {...register('stock')} />
                    {errors.stock && (
                      <p className="text-sm text-red-500 mt-1">{errors.stock.message}</p>
                    )}
                  </div>
                </div>

                {/* 🔹 Carga de imágenes */}
                <div className="space-y-3">
                  <Label htmlFor="images" className="flex items-center gap-2 text-sm font-medium">
                    <ImagePlus className="h-4 w-4" /> Imágenes del producto
                    <span className="text-red-500">*</span>
                  </Label>

                  {/* Área de carga mejorada */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                    <div className="text-center">
                      <ImagePlus className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Haz clic en el botón para seleccionar imágenes
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        Formatos: JPG, PNG, WEBP (máx. 10 imágenes)
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('images')?.click()}
                        className="mb-2"
                      >
                        <ImagePlus className="h-4 w-4 mr-2" />
                        Seleccionar Imágenes
                      </Button>
                    </div>
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>

                  {/* Previsualización mejorada */}
                  {previewUrls.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        Imágenes seleccionadas ({previewUrls.length}):
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {previewUrls.map((url, i) => (
                          <div key={i} className="relative group">
                            <img
                              src={url}
                              alt={`preview-${i}`}
                              className="w-full h-24 object-cover rounded-md border shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newFiles = imageFiles.filter((_, index) => index !== i);
                                const newUrls = previewUrls.filter((_, index) => index !== i);
                                setImageFiles(newFiles);
                                setPreviewUrls(newUrls);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mensaje de ayuda */}
                  <p className="text-xs text-gray-500">
                    💡 Tip: Selecciona múltiples imágenes para mostrar diferentes ángulos del producto
                  </p>

                  {/* Mostrar errores de validación */}
                  {errors.images && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.images.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isAvailable"
                    checked={watch('isAvailable')}
                    onCheckedChange={(checked) => setValue('isAvailable', checked)}
                  />
                  <Label htmlFor="isAvailable">Disponible</Label>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingProduct ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de productos */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-b-2 border-gray-900 rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition">
              <div className="aspect-square bg-muted/50 flex items-center justify-center">
                {product.images && product.images.length > 0 ? (
                  (() => {
                    const img = product.images[0];
                    const url = typeof img === 'string' ? img : (img as any)?.url;
                    return url ? (
                      <img src={url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-gray-400 text-center">
                        <div className="text-4xl mb-2">📦</div>
                        <div className="text-sm">Sin imagen</div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-gray-400 text-center">
                    <div className="text-4xl mb-2">📦</div>
                    <div className="text-sm">Sin imagen</div>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                <p className="text-sm text-foreground/80 line-clamp-2">{product.description}</p>
                <p className="text-sm text-foreground/80 mb-1">
                  {product.category?.name || 'Sin categoría'}
                </p>
                <p className="text-primary font-bold mb-1">
                  Bs {Math.round(product.price)}
                </p>
                <p className="text-sm text-foreground/80 mb-3">Stock: {product.stock}</p>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                    <Pencil className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteMutation.mutate(product.id)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pagination && (
        <PaginationControls
          pagination={pagination}
          onPageChange={setPage}
          className="mt-6"
        />
      )}
    </div>
  );
}
