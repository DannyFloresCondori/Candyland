import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Length(2, 200, {
    message: 'El nombre debe tener entre 2 y 200 caracteres',
  })
  @Transform(({ value }) => value?.toString().trim())
  name: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(500, {
    message: 'La descripción no puede exceder los 500 caracteres',
  })
  @Transform(({ value }) => value?.toString().trim())
  description?: string;

  @IsOptional()
  @IsString({ message: 'El slug debe ser una cadena de texto' })
  @Length(2, 250, {
    message: 'El slug debe tener entre 2 y 250 caracteres',
  })
  @Transform(({ value }) => value?.toString().toLowerCase().trim())
  slug?: string;

  @IsNotEmpty({ message: 'El precio es obligatorio' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número válido con máximo 2 decimales' },
  )
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @IsNotEmpty({ message: 'El stock es obligatorio' })
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  @Transform(({ value }) => parseInt(value))
  stock: number;

  @IsOptional()
  @IsBoolean({ message: 'isAvailable debe ser verdadero o falso' })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  isAvailable?: boolean;

  @IsOptional()
  @IsArray({ message: 'Las imágenes deben ser un array' })
  @IsString({ each: true, message: 'Cada imagen debe ser una URL válida' })
  @ArrayMinSize(1, {
    message: 'Debe proporcionar al menos una imagen si incluye el campo',
  })
  images?: string[];

  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  @IsUUID(4, { message: 'El ID de categoría debe ser un UUID válido' })
  categoryId: string;
}
