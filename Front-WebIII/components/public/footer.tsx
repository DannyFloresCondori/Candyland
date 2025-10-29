'use client';

import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer-bg border-t mt-10 text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        {/* Columna 1: Marca y descripción */}
        <div>
          <h2 className="text-2xl font-bold text-primary mb-3">Candyland</h2>
          <p className="text-sm text-slate-600">
            Endulzando tus momentos con la mejor variedad de dulces y postres.  
            ¡Descubre el sabor de la felicidad en cada pedido!
          </p>
        </div>

        {/* Columna 2: Enlaces rápidos */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Enlaces</h3>
          <ul className="space-y-2 text-foreground/80">
            <li>
              <Link href="/home" className="hover:text-primary transition">
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-primary transition">
                Sobre Nosotros
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-primary transition">
                Contáctanos
              </Link>
            </li>
            <li>
              <Link href="/my-orders" className="hover:text-primary transition">
                Mis Pedidos
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna 3: Redes sociales */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Síguenos</h3>
          <div className="flex justify-center md:justify-start space-x-4">
            <a href="#" aria-label="Facebook" className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition">
              <FaFacebookF className="text-primary" size={18} />
            </a>
            <a href="#" aria-label="Instagram" className="p-2 bg-pink-50 rounded-full hover:bg-pink-100 transition">
              <FaInstagram className="text-pink-500" size={18} />
            </a>
            <a href="#" aria-label="Twitter" className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition">
              <FaTwitter className="text-primary/90" size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Línea inferior */}
      <div className="border-t py-4 text-center text-sm text-foreground/70">
        © {new Date().getFullYear()} <span className="font-medium text-primary">Candyland</span>. Todos los derechos reservados.
      </div>
    </footer>
  );
}
