'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IceCream, Users, MapPin } from 'lucide-react';
import ImagenHelados from '@/img/descarga (1).jpeg'
import ImagenPostres from '@/img/postresCandyland.jpeg'
import ImagenEquito from '@/img/equipoCandyland.jpeg'

export default function NosotrosPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-6 text-center">Sobre Nosotros 🍨</h1>

      {/* Sección de presentación */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <IceCream className="text-pink-500 w-6 h-6" />
            Bienvenidos a Candyland
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            En épocas de calor lo que más sale a la venta son los productos que refrescan, y una buena opción para la temporada
            son nuestros deliciosos helados, postres y pastelitos 🎂. <br /><br />
            <strong>Candyland</strong> es un negocio joven que ha mostrado un crecimiento estable desde sus inicios.
            Ubicado en la <strong>Av. Simón López entre Av. Beiging</strong>, Candyland destaca por sus postres con
            <strong> diseños únicos y personalizados</strong>, elaborados a pedido del cliente, lo que lo convierte en un favorito
            entre nuestros visitantes más frecuentes.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="relative h-64 rounded-xl overflow-hidden shadow-md">
              <Image
                src={ImagenHelados}
                alt="Helados Candyland"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative h-64 rounded-xl overflow-hidden shadow-md">
              <Image
                src={ImagenPostres}
                alt="Postres Candyland"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección del equipo */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Users className="text-primary w-6 h-6" />
            Nuestro Equipo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground/80 leading-relaxed">
            En Candyland creemos que el secreto del éxito está en la pasión 💖. Nuestro equipo de reposteros y heladeros
            se dedica con amor a crear cada sabor y diseño, buscando siempre innovar y sorprenderte con nuevas creaciones.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="relative h-56 rounded-xl overflow-hidden shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"
                alt="Equipo Candyland 1"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative h-56 rounded-xl overflow-hidden shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
                alt="Equipo Candyland 2"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative h-56 rounded-xl overflow-hidden shadow-md">
              <Image
                src={ImagenEquito}
                alt="Equipo Candyland 3"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección ubicación */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <MapPin className="text-green-600 w-6 h-6" />
            Nuestra Ubicación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground/80">
            📍 Nos encontramos en la <strong>Av. Simón López entre Av. Beiging</strong>.  
            ¡Ven a visitarnos y disfruta de un momento dulce y refrescante!
          </p>

          <div className="relative h-64 rounded-xl overflow-hidden shadow-md">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
              alt="Local Candyland"
              fill
              className="object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
