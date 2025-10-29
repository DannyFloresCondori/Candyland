import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export class PaginationDto{
    @IsOptional()
    @Type(()=> Number)
    @IsInt({ message: 'La Pagina debe ser un numero entero'})
    @Min(1, {message: 'la pagina debe ser mayor a 0'})
    page?: number;

    @IsOptional()
    @Type(()=> Number)
    @IsInt({ message: 'El limite debe ser un numero entero'})
    @Min(1, {message: 'el limite minimo es 1'})
    @Max(20, {message: 'lo maximo del limite es 20'})
    limit?: number;
}