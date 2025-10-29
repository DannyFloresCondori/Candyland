import { PartialType } from '@nestjs/mapped-types';
import { CreateEcommerceDetailDto } from './create-ecommerceDetail.dto';

export class UpdateEcommerceDetailDto extends PartialType(CreateEcommerceDetailDto) {}
