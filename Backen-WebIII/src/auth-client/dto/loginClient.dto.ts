import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginClientDto {
    @IsEmail({}, { message: 'debe ser un email' })
    @IsNotEmpty({ message: 'El email es requerido ' })
    email: string;

    @IsString({ message: 'la contraseña debe ser cadena de texto' })
    @MinLength(6, { message: 'la contraseña debe tener al menos 6 caracteres' })
    password: string;
}