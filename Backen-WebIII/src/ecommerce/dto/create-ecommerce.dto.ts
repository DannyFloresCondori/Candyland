import { Transform, Type } from 'class-transformer';
import {
    IsNotEmpty,
    IsOptional,
    IsString,
    Length,
    MaxLength,
    IsIn,
    IsNumber,
    IsUUID,
    IsArray,
    ArrayMinSize,
    ValidateNested,
} from 'class-validator';
import { CreateEcommerceDetailDto } from '../dto-detail/create-ecommerceDetail.dto';

export class CreateEcommerceDto {

    @IsNotEmpty({ message: 'El ID del cliente es obligatorio' })
    @IsUUID(4, { message: 'El ID del cliente debe ser un UUID válido' })
    clientId: string;

    @IsString({ message: 'El nombre del cliente debe ser una cadena de texto' })
    @Length(2, 20, {
        message: 'El nombre del cliente debe tener entre 2 y 20 caracteres',
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

    @IsOptional()
    @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
    @IsUUID(4, { message: 'El ID del usuario debe ser un UUID válido' })
    userId: string;

    @IsArray({ message: 'Los detalles deben ser un array' })
    @ArrayMinSize(1, { message: 'Debe haber al menos un detalle en el pedido' })
    @ValidateNested({ each: true })
    @Type(() => CreateEcommerceDetailDto)
    ecommerceDetail: CreateEcommerceDetailDto[];
}
