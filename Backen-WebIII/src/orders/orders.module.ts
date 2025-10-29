
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { orderDetail } from './entities/orderDetail.entity';
import { Product } from 'src/products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, orderDetail, Product])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [ OrdersService],
})
export class OrdersModule {}
