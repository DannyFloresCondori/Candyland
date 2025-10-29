import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  IsIn,
  IsNumber,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { CreateOrderDetailDto } from '../dto-detail/create-orderDetail.dto';

export class CreateOrderDto {
  @IsNotEmpty({ message: 'El nombre del cliente es obligatorio' })
  @IsString({ message: 'El nombre del cliente debe ser una cadena de texto' })
  @Length(2, 50, {
    message: 'El nombre del cliente debe tener entre 2 y 50 caracteres',
  })
  @Transform(({ value }) => value?.toString().trim())
  nameClient: string;

  @IsOptional()
  @IsString({ message: 'El nombre de la empresa debe ser una cadena de texto' })
  @MaxLength(50, {
    message: 'El nombre de la empresa no puede exceder los 50 caracteres',
  })
  @Transform(({ value }) => value?.toString().trim())
  nameCompany?: string;

  @IsOptional()
  @IsString({ message: 'El estado debe ser una cadena de texto' })
  @IsIn(['Pendiente', 'Vendido', 'Rechazado'], {
    message: 'El estado debe ser Pendiente, Vendido o Rechazado',
  })
  @Transform(({ value }) => value?.toString().trim())
  status?: string;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El total debe ser un número válido con máximo 2 decimales' },
  )
  @Transform(({ value }) => parseFloat(value))
  total?: number;

  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  @IsUUID(4, { message: 'El ID del producto debe ser un UUID válido' })
  userId: string;

  @IsArray({ message: 'Los detalles deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe haber al menos un detalle en el pedido' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDetailDto)
  orderDetails: CreateOrderDetailDto[];
}
