'use client';

import { useState, useEffect } from 'react';
import { fetchData } from '@/services/api';
import { toast } from 'sonner';


export interface ProductImage{
  id: string;
  url: string;
  productId?: string;
  createdAt?: string;
}

export interface CreateProductImage{
  url: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  product: {
    images: ProductImage[];
    name: string 
};
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  // 🔹 Cargar carrito desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem('cart');
    console.log('🛒 Cargando carrito desde localStorage:', stored);
    if (stored) {
      try {
        const parsedItems = JSON.parse(stored);
        console.log('🛒 Carrito parseado:', parsedItems);
        setItems(parsedItems);
      } catch (error) {
        console.error('🛒 Error al parsear carrito:', error);
        setItems([]);
      }
    }
  }, []);

  // 🔹 Escuchar cambios del localStorage (sincroniza entre pestañas)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      console.log('🛒 Storage change detected:', event.key, event.newValue);
      if (event.key === 'cart') {
        const newItems = event.newValue ? JSON.parse(event.newValue) : [];
        console.log('🛒 Actualizando carrito desde storage:', newItems);
        setItems(newItems);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 🔹 Guardar carrito
  const saveCart = (newItems: CartItem[]) => {
    console.log('🛒 Guardando carrito:', newItems);
    setItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
    window.dispatchEvent(new Event('storage')); // fuerza actualización visual en navbar
  };

  // 🔹 Obtener producto del backend
  const fetchProductById = async (productId: string) => {
    try {
      return await fetchData(`products/${productId}`);
    } catch (error) {
      toast.error('Error al obtener el producto');
      return null;
    }
  };

  // 🔹 Agregar producto al carrito
  const addItem = async (productId: string, quantity = 1) => {
    const product = await fetchProductById(productId);
    if (!product) return;

    const stock = product.stock ?? 0;
    const unitPrice = product.price ?? 0;

    const existing = items.find((i) => i.productId === productId);
    const currentQuantity = existing ? existing.quantity : 0;
    const newQuantity = currentQuantity + quantity;

    if (newQuantity > stock) {
      toast.error(`Solo hay ${stock} unidades disponibles de ${product.name}`);
      return;
    }

    const updatedItems = existing
      ? items.map((i) =>
          i.productId === productId
            ? { ...i, quantity: newQuantity, subTotal: newQuantity * i.unitPrice }
            : i
        )
      : [
          ...items,
          {
            productId,
            quantity,
            unitPrice,
            subTotal: unitPrice * quantity,
            product: { 
              images: Array.isArray(product.images) ? product.images : [],
              name: product.name },
          },
        ];

    saveCart(updatedItems);
    toast.success(`${product.name} agregado al carrito`);
  };

  // 🔹 Actualizar cantidad manualmente (input o botones)
  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    const product = await fetchProductById(productId);
    if (!product) return;

    const stock = product.stock ?? 0;
    const unitPrice = product.price ?? 0;

    if (newQuantity > stock) {
      toast.error(`Solo hay ${stock} unidades disponibles de ${product.name}`);
      return;
    }

    const updatedItems = items.map((i) =>
      i.productId === productId
        ? { ...i, quantity: newQuantity, subTotal: newQuantity * unitPrice }
        : i
    );

    saveCart(updatedItems);
    toast.info(`Cantidad actualizada: ${product.name} (${newQuantity})`);
  };

  // 🔹 Eliminar producto
  const removeItem = (productId: string) => {
    const found = items.find((i) => i.productId === productId);
    if (found) toast.info(`${found.product.name} eliminado del carrito`);
    saveCart(items.filter((i) => i.productId !== productId));
  };

  // 🔹 Vaciar carrito
  const clearCart = () => {
    saveCart([]);
    toast.info('Carrito vaciado');
  };

  //sincroniza con el localStorage 
  const syncCart = () => {
    const saved = localStorage.getItem('cart');
    if (saved) setItems(JSON.parse(saved));
  };

  // 🔹 Calcular totales
  const total = items.reduce((sum, i) => sum + i.subTotal, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  
  console.log('🛒 Estado del carrito:', { 
    items: items.length, 
    itemCount, 
    total,
    itemsDetails: items.map(i => ({ id: i.productId, quantity: i.quantity, name: i.product.name }))
  });


  return {
    items,
    addItem,
    updateQuantity, // ✅ nueva función
    removeItem,
    clearCart,
    total,
    itemCount,
    syncCart,
  };
}
