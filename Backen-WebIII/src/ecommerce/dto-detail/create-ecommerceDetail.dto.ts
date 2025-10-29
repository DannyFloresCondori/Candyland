import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsUUID,
  IsInt,
  Min,
  IsNumber,
  IsPositive,
  IsOptional,
} from 'class-validator';

export class CreateEcommerceDetailDto {
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  @IsUUID(4, { message: 'El ID del producto debe ser un UUID válido' })
  productId: string;

  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad mínima es 1' })
  @Transform(({ value }) => parseInt(value))
  quantity: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  unitPrice?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  subTotal?: number;
}
