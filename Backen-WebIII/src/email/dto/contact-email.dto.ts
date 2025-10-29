import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class ContactEmailDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  name: string;

  @IsNotEmpty({ message: 'El correo es obligatorio' })
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  email: string;

  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  @Length(4, 2000, { message: 'El mensaje debe tener entre 4 y 2000 caracteres' })
  message: string;
}
