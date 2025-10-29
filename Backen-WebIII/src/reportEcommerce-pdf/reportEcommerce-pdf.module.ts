import { Module } from '@nestjs/common';
import { ReportPdfService } from './reportEcommerce-pdf.service';
import { ReportPdfController } from './reportEcommerce-pdf.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ecommerce } from 'src/ecommerce/entities/ecommerce.entity';
import { ecommerceDetail } from 'src/ecommerce/entities/ecommerceDetail.entity';
import { EcommerceModule } from 'src/ecommerce/ecommerce.module';
import { EcommerceService } from 'src/ecommerce/ecommerce.service';


@Module({
  imports: [TypeOrmModule.forFeature([Ecommerce, ecommerceDetail ]), EcommerceModule ],
  controllers: [ReportPdfController],
  providers: [ReportPdfService, EcommerceService],
})
export class ReportEcommercePdfModule{}
