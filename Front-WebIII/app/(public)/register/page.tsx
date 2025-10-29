'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/lib/services/auth.service';
import { setAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// ✅ Esquema de validación con Zod
const registerSchema = z.object({
  email: z.string().email('Debe ser un correo electrónico válido'),
  password: z.string().min(5, 'La contraseña debe tener al menos 5 caracteres'),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(3, 'El apellido debe tener al menos 3 caracteres'),
  phone: z
    .string()
    .regex(/^(\+\d{1,4})?[\s\-]?\d{6,15}$/, 'Formato inválido. Ejemplo: +59170123456'),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  companyName: z.string().optional(),
  role: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // 🔥 Reemplazamos onSubmit por tu handleRegister mejorado
  const onSubmit = async (formData: RegisterFormData) => {
    setLoading(true);
    try {
      // Registro + login automático (gracias al authService modificado)
      const response = await authService.registerClient({
        ...formData,
        role: 'client', // opcional: define el rol
      });

      // Guarda token y usuario
      setAuth(response.access_token, response.user);

      // 🥳 Mensaje de bienvenida
      toast.success(`Bienvenido, Sr. ${response.user.role}!`);

      // Redirige al home o dashboard
      router.push('/home');
    } catch (error) {
      console.error(error);
      toast.error('Error al registrarte. Verifica tus datos o tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Crear Cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="firstName">Nombre</Label>
              <Input id="firstName" placeholder="Juan" {...register('firstName')} />
              {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
            </div>

            <div>
              <Label htmlFor="lastName">Apellido</Label>
              <Input id="lastName" placeholder="Pérez" {...register('lastName')} />
              {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
            </div>

            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" placeholder="correo@ejemplo.com" {...register('email')} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" placeholder="+59170123456" {...register('phone')} />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>

            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" placeholder="Av. Principal #123" {...register('address')} />
              {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
            </div>

            <div>
              <Label htmlFor="companyName">Nombre de la Empresa (opcional)</Label>
              <Input id="companyName" placeholder="Mi Empresa SRL" {...register('companyName')} />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </Button>

            <p className="text-center text-sm text-foreground/70">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Inicia sesión
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
