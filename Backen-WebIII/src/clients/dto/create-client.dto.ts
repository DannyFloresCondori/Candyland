import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  IsBoolean,
} from 'class-validator';

export class CreateClientDto {
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  @Transform(({ value }) => value?.toString().toLowerCase().trim())
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @Transform(({ value }) => value?.toString().trim())
  @Length(5, 255, {
    message: 'La contraseña debe tener entre 5 y 255 caracteres',
  })
  password: string;

  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Length(2, 100, {
    message: 'El nombre debe tener entre 2 y 100 caracteres',
  })
  @Transform(({ value }) => value?.toString().trim())
  firstName: string;

  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @Length(3, 100, {
    message: 'El apellido debe tener entre 3 y 100 caracteres',
  })
  @Transform(({ value }) => value?.toString().trim())
  lastName: string;

  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @Matches(/^(\+\d{1,4})?[\s\-]?\d{6,15}$/, {
    message: 'Formato inválido. Ejemplos: +59170123456, +591 70123456',
  })
  @Transform(({ value }) =>
    value?.toString().replace(/[\s\-]/g, '').trim(),
  )
  phone: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toString().trim())
  role: string;

  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @Transform(({ value }) => value?.toString().trim())
  address: string;

  @IsOptional()
  @IsString({ message: 'El nombre de la empresa debe ser una cadena de texto' })
  @Transform(({ value }) => value?.toString().trim())
  companyName?: string;

  @IsBoolean({ message: 'El campo isActive debe ser un valor booleano' })
  @IsOptional()
  isActive?: boolean;

  @IsBoolean({ message: 'El campo isEmailVerified debe ser un valor booleano' })
  @IsOptional()
  isEmailVerified?: boolean;
}
