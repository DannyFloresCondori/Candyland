'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const roleSynonyms: Record<string, string[]> = {
  admin: ['admin', 'administrador', 'administrator'],
};

function normalizeRole(r?: unknown) {
  if (!r) return '';
  return String(r).toLowerCase().trim();
}

function extractRoleFromUser(user: any) {
  if (!user) return '';
  return (
    user.role ?? user.rol ?? (user.roles && user.roles[0] && user.roles[0].name) ?? user.roleName ?? ''
  );
}

function roleMatches(userRole?: string, required?: string) {
  if (!required) return true;
  // userRole may be undefined; try to extract more robustly
  let uRaw = userRole ?? '';
  const r = normalizeRole(required);
  let u = normalizeRole(uRaw);

  if (u === r) return true;

  // check synonyms groups
  for (const groupKey of Object.keys(roleSynonyms)) {
    const group = roleSynonyms[groupKey].map((s) => s.toLowerCase());
    if (group.includes(r) && group.includes(u)) return true;
  }

  return false;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('ProtectedRoute: no user, redirecting to /login');
        router.push('/login');
      } else {
        const effectiveRole = extractRoleFromUser(user as any);
        if (requiredRole && !roleMatches(effectiveRole, requiredRole)) {
          console.log('ProtectedRoute: role mismatch', { effectiveRole, requiredRole, rawUser: user });
          router.push('/');
        }
      }
    }
  }, [user, loading, requiredRole, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  const effectiveRole = extractRoleFromUser(user as any);
  if (!user || (requiredRole && !roleMatches(effectiveRole, requiredRole))) {
    return null;
  }

  return <>{children}</>;
}
