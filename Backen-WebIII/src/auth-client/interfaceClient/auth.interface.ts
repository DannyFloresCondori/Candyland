
// Interface para el payload de jwt
export interface JwtPayload{
    sub: string;
    email: string;
    iat?: number;
    exp?: number;
}

// Interface para el perfil publico del usuario
export interface ClientProfile{
    id: string;
    email: string;
    role?: string; // opcional si tu backend devuelve el rol
    firstName?: string;
    lastName?: string;
}

// Interface para la respuesta del login
export interface LoginResponse{
    access_token: string;
    token_type: string;
    expires_in: number;
    user: ClientProfile;
}