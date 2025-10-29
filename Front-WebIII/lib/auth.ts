// src/lib/auth.ts
export const setAuth = (token: string, user: any) => {
  // Save token under both keys for backward compatibility with older code
  localStorage.setItem('token', token);
  localStorage.setItem('access_token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  // Disparar evento de storage para sincronizar con useAuth hook
  window.dispatchEvent(new Event('storage'));
};

export const getAuth = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return { token, user };
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
};
