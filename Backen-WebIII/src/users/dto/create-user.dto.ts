import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';

export class CreateUserDto {
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

  @IsString({ message: 'Los nombres deben ser una cadena de texto' })
  @IsNotEmpty({ message: 'Los nombres son obligatorios' })
  @Length(2, 100, {
    message: 'Los nombres deben tener entre 2 y 100 caracteres',
  })
  @Transform(({ value }) => value?.toString().trim())
  firstName: string;

  @IsString({ message: 'Los apellidos deben ser una cadena de texto' })
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  @Length(3, 100, {
    message: 'Los apellidos deben tener entre 3 y 100 caracteres',
  })
  @Transform(({ value }) => value?.toString().trim())
  lastName: string;

  @IsString({ message: 'El C.I. debe ser válido' })
  @IsNotEmpty({ message: 'El C.I. es obligatorio' })
  @Matches(/^\d{7,10}(-[0-9A-Za-z]{1,3})?$/, {
    message:
      'Formato de CI inválido. Ejemplos: 8502732, 1234567890 o 8502732-1B',
  })
  @Transform(({ value }) => value?.toString().toUpperCase().trim())
  documentNumber: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @Matches(/^(\+\d{1,4})?[\s\-]?\d{6,15}$/, {
    message: 'Formato inválido. Ejemplos: +59170123456, +591 70123456',
  })
  @Transform(({ value }) =>
    value
      ?.toString()
      .replace(/[\s\-]/g, '')
      .trim(),
  )
  phone?: string;

  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @Length(5, 200, {
    message: 'La dirección debe tener entre 5 y 200 caracteres',
  })
  @Transform(({ value }) => value?.toString().trim())
  address: string;

  @IsUUID(4, { message: 'Debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  roleId: string;
}

