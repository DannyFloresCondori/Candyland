'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, LogOut, Bell } from 'lucide-react';
import { getCartItemCount } from '@/lib/cart-utils';
import ImageLogo from '@/img/Logo.jpeg';
import Image from 'next/image';


export function PublicNavbar() {
  const { user, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  // 🔹 Cargar cantidad inicial del carrito
  useEffect(() => {
    setCartCount(getCartItemCount());
  }, []);

  // 🔹 Escuchar cambios en localStorage o eventos personalizados
  useEffect(() => {
    const updateCartCount = () => setCartCount(getCartItemCount());

    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b navbar-bg px-6">
      {/* 👈 Izquierda */}
      <div className="flex items-center gap-6">
        <Link href="/home" className="block hover:opacity-90 transition-opacity">
          <div className="flex items-center">
            <Image
              src={ImageLogo}
              alt="Helados Candyland"
              width={100}
              height={100}
              className="object-contain rounded-[30px]"
            />
          </div>
        </Link>


        <nav className="flex items-center gap-6">
          <Link href="/home" className="text-sm font-medium hover:text-primary">
            Inicio
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary">
            Sobre Nosotros
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary">
            Contáctanos
          </Link>
          {user?.role === 'client' && (
            <Link href="/my-orders" className="text-sm font-medium hover:text-primary">
              Mis Pedidos
            </Link>
          )}
        </nav>
      </div>

      {/* 👉 Derecha */}
      <div className="flex items-center gap-4">
        {/* 🔔 Notificaciones */}
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        {/* 🛒 Carrito con contador */}
        <Link href="/cart">
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                {cartCount}
              </span>
            )}
          </Button>
        </Link>

        {/* 👤 Perfil */}
        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60">
              <User className="h-5 w-5 text-foreground/70" />
            </div>
            <div className="text-sm">
              <p className="font-medium">{user.firstName}</p>
              <p className="text-xs text-foreground/70">{user.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/register">
              <Button>Registrarse</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
