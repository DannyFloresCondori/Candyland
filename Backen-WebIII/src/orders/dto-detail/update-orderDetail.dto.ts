import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDetailDto } from './create-orderDetail.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDetailDto) {}
