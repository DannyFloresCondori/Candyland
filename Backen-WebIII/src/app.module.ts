import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { CategoriesModule } from './categories/categories.module';
import { CommonModule } from './common/common.module';
import { ProductsModule } from './products/products.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { AuthClientModule } from './auth-client/auth-client.module';
import { OrdersModule } from './orders/orders.module';
import { EcommerceModule } from './ecommerce/ecommerce.module';
import { ReportOrderPdfModule } from './reportOrders-pdf/report-pdf.module';
import { ReportEcommercePdfModule } from './reportEcommerce-pdf/reportEcommerce-pdf.module';
import { FilesModule } from './files/files.module';
import { MailModule } from './email/email.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
      inject: [ConfigService],
    }),
    CategoriesModule,
    CommonModule,
    ProductsModule,
    RolesModule,
    UsersModule,
    AuthModule,
    ClientsModule,
    AuthClientModule,
    OrdersModule,
    ReportOrderPdfModule,
    ReportEcommercePdfModule,
    EcommerceModule,
    FilesModule,
    MailModule,
  ],
})
export class AppModule {}
