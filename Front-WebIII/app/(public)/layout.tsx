'use client';

import Footer from '@/components/public/footer';
import { PublicNavbar } from '@/components/public/navbar';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-public-gradient text-foreground">
      <PublicNavbar />
      <main className="container mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}
