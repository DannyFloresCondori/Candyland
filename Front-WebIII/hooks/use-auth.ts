'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchData } from '@/services/api';
import { UserProfile } from '@/lib/services/auth.service';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔹 Carga el usuario desde el token/localStorage
  const loadUser = async () => {
    const token = localStorage.getItem('access_token') ?? localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    // Si no hay token o usuario, limpiar y salir
    if (!token || !storedUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Intentar parsear el usuario guardado
    let parsedUser: any = null;
    try {
      parsedUser = storedUser ? JSON.parse(storedUser) : null;
    } catch (err) {
      console.error('❌ Error al parsear el usuario guardado:', err);
      localStorage.removeItem('user');
      parsedUser = null;
    }

    // Si no se pudo parsear el usuario, terminar
    if (!parsedUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Determinar endpoint según el rol
    const role = parsedUser?.role ? String(parsedUser.role).toLowerCase().trim() : '';
    const endpoint =
      role === 'administrador' || role === 'admin' || role === 'administrator'
        ? 'auth/me'
        : 'auth-client/me-client';

    try {
      const response = await fetchData(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Puede variar según tu backend, ajusta si devuelve el user directo o dentro de { user }
      const fetchedUser = response?.user ?? response ?? null;

      // Fusionar datos del backend con los del localStorage
      let finalUser = parsedUser;
      if (fetchedUser) {
        finalUser = {
          ...fetchedUser,
          role:
            fetchedUser.role ??
            parsedUser.role ??
            fetchedUser.rol ??
            parsedUser.rol,
        };
      }

      // Actualizar localStorage y estado
      localStorage.setItem('user', JSON.stringify(finalUser));
      setUser(finalUser);
    } catch (error) {
      console.error('⚠️ Error al obtener datos del usuario:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setUser(null);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Cargar usuario al montar el hook o cambiar ruta
  useEffect(() => {
    loadUser();
  }, [router]);

  // 🔹 Escuchar cambios del localStorage (sincroniza entre pestañas)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'user') {
        setUser(event.newValue ? JSON.parse(event.newValue) : null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 🔹 Login: guarda token y usuario, y actualiza el estado global
  const login = (token: string, userData: UserProfile) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setLoading(false); // Asegurar que no esté en loading
    window.dispatchEvent(new Event('storage')); // fuerza actualización visual en navbar
  };

  // 🔹 Logout: limpia todo y redirige
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('storage'));
    router.push('/login');
  };

  return { user, loading, login, logout, setUser };
}
