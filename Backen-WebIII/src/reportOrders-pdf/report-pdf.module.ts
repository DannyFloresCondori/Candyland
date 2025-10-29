import { Module } from '@nestjs/common';
import { ReportPdfService } from './report-pdf.service';
import { ReportPdfController } from './report-pdf.controller';
import { OrdersModule } from '../orders/orders.module';
import { OrdersService } from 'src/orders/orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { orderDetail } from 'src/orders/entities/orderDetail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, orderDetail]), OrdersModule],
  controllers: [ReportPdfController],
  providers: [ReportPdfService, OrdersService],
})
export class ReportOrderPdfModule{}
