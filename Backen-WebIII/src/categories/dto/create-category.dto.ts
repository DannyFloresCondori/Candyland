import {
    IsString,
    IsNotEmpty,
    Length,
    IsOptional,
    IsUrl,
    MaxLength,
    IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @Length(2, 60, {
        message: 'El nombre debe tener entre 2 y 60 caracteres',
    })
    @Transform(({ value }) => value?.toString().trim())
    name: string;

    @IsOptional()
    @IsString({ message: 'La descripción debe ser una cadena de texto' })
    @MaxLength(500, {
        message: 'La descripción no puede exceder los 500 caracteres',
    })
    @Transform(({ value }) => value?.toString().trim() || null)
    description?: string;

    @IsOptional()
    @IsString({ message: 'El slug debe ser una cadena de texto' })
    @Length(2, 250, {
        message: 'El slug debe tener entre 2 y 250 caracteres',
    })
    @Transform(({ value }) => value?.toString().toLowerCase().trim())
    slug?: string;

    @IsOptional()
    @IsBoolean({ message: 'isActive deber ser falso o verdadero'})
    isActive?: boolean;

    @IsOptional()
    @IsUrl(
        {
            protocols: ['http', 'https'],
            require_protocol: true,
        },
        { message: 'La URL de la imagen debe ser válida (http/https)' },
    )
    @MaxLength(255, {
        message: 'La URL de la imagen no puede exceder los 255 caracteres',
    })
    @Transform(({ value }) => value?.toString().trim() || null)
    imageUrl?: string;
}
