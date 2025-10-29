'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/lib/services/auth.service';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('por favor ingresa un correo valido'),
  password: z.string().min(1, 'por favor Ingresa la contraseña'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      // Intentamos primero el login de cliente
      let response;
      try {
        response = await authService.loginClient(data);
      } catch (clientError) {
        // Si falla el login de cliente, intentamos con admin
        response = await authService.loginAdmin(data);
      }

      // Guardar token y usuario usando el hook useAuth
      login(response.access_token, response.user ?? {});
      toast.success('Login successful');

      // Extraer rol de manera flexible
      const anyUser = (response as any).user ?? {};
      const rawRole =
        anyUser.role ??
        anyUser.rol ??
        (anyUser.roles && anyUser.roles[0] && anyUser.roles[0].name) ??
        anyUser.roleName ??
        '';

      const userRole = rawRole ? String(rawRole).toLowerCase().trim() : '';
      const adminNames = ['admin', 'administrador', 'administrator'];
      const isAdmin = adminNames.includes(userRole);

      toast(`Bienvenido Sr. ${response.user.role}`);

      // Redirigir según el rol detectado usando window.location.href para evitar conflictos
      // Aumentamos el delay para asegurar que el estado se guarde correctamente
      setTimeout(() => {
        if (isAdmin) {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/home';
        }
      }, 1500);
    } catch (error) {
      console.error('login error', error);
      toast.error('Datos Invalidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Inicio de Sessión</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Correo electronico"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Iniciando...' : 'Iniciar Session'}
            </Button>

            <p className="text-center text-sm text-foreground/70">
              ¿No tienes alguna Cuenta?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Registrate
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
