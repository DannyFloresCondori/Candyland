'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { Sidebar } from '@/components/admin/sidebar';
import { Navbar } from '@/components/admin/navbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="Administrador">
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Navbar />
          <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
