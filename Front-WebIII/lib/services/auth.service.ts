// src/lib/services/auth.service.ts
import { fetchData } from "@/services/api";
import { setAuth } from "@/lib/auth";

interface LoginDto {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserProfile;
}

interface RegisterClientDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  companyName?: string;
  role?: string;
}

export const authService = {
  loginClient: async (data: LoginDto): Promise<LoginResponse> => {
    return fetchData('auth-client/loginClient', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  loginAdmin: async (data: LoginDto): Promise<LoginResponse> => {
    return fetchData('auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  registerClient: async (data: RegisterClientDto): Promise<LoginResponse> => {
    // 1️⃣ Primero registramos al cliente
    await fetchData('clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    // 2️⃣ Luego iniciamos sesión automáticamente
    const loginResponse = await authService.loginClient({
      email: data.email,
      password: data.password,
    });

    // 3️⃣ Guardamos el token y el usuario
    setAuth(loginResponse.access_token, loginResponse.user);

    // 4️⃣ Devolvemos la respuesta por si la necesita el frontend
    return loginResponse;
  },
};
