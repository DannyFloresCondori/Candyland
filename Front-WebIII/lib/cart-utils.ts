// src/lib/cart-utils.ts
export function getCartItemCount(): number {
  if (typeof window === 'undefined') return 0; // prevención SSR (Next.js)
  const stored = localStorage.getItem('cart');
  if (!stored) return 0;

  try {
    const items = JSON.parse(stored);
    return items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  } catch {
    return 0;
  }
}
