'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const res = await fetch(`${apiBase}/mail/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Error al enviar' }));
        throw new Error(err.message || 'Error al enviar el mensaje');
      }

      toast.success('Tu mensaje ha sido enviado con éxito 🎉');
      setFormData({ name: '', email: '', message: '' });
    } catch (error: any) {
      console.error('Error enviando mensaje:', error);
      toast.error(error.message || 'No se pudo enviar el mensaje');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-6 text-center">Contáctanos 📞</h1>
      <p className="text-center text-foreground/70 mb-8 max-w-2xl mx-auto">
        ¿Tienes alguna pregunta, sugerencia o simplemente quieres saludarnos?  
        ¡Nos encantaría saber de ti! Completa el formulario o usa cualquiera de nuestros medios de contacto.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Envíanos un mensaje</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <Input
                  type="text"
                  name="name"
                  placeholder="Tu nombre completo"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Correo electrónico</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="tuemail@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mensaje</label>
                <Textarea
                  name="message"
                  placeholder="Escribe tu mensaje aquí..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSending}>
                {isSending ? (
                  <>
                    <Send className="mr-2 h-4 w-4 animate-pulse" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar mensaje
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Información de contacto */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Información de contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/80">
              <div className="flex items-center gap-3">
                <MapPin className="text-green-600" />
                <span>Av. Simón López entre Av. Beiging, Cochabamba</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-primary" />
                <span>+591 700-12345</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-primary/90" />
                <span>contacto@candyland.com</span>
              </div>
            </CardContent>
          </Card>

          <div className="relative h-64 rounded-xl overflow-hidden shadow-md">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
              alt="Heladería Candyland contacto"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
