// src/services/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export async function fetchData(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('access_token');

    const res = await fetch(`${API_URL}/${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include', // si usas cookies/sesiones
        ...options,
    });

    if (!res.ok) {
        throw new Error(`Error fetching data: ${res.status} - ${res.statusText}`);
    }

    return res.json();
}

