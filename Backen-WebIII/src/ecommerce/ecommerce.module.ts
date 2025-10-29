import { Module } from '@nestjs/common';
import { EcommerceService } from './ecommerce.service';
import { EcommerceController } from './ecommerce.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ecommerce } from './entities/ecommerce.entity';
import { ecommerceDetail } from './entities/ecommerceDetail.entity';
import { AuthClientModule } from 'src/auth-client/auth-client.module';
import { ClientsModule } from 'src/clients/clients.module';
import { Client } from 'src/clients/entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ecommerce, ecommerceDetail,Client]),
    AuthClientModule, ClientsModule],
  controllers: [EcommerceController],
  providers: [EcommerceService],
  exports: [EcommerceService, TypeOrmModule],
})
export class EcommerceModule {}
