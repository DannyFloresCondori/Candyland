import { Module } from '@nestjs/common';
import { AuthClientService } from './auth-client.service';
import { AuthClientController } from './auth-client.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from 'src/clients/entities/client.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { ConfigService } from '@nestjs/config';
import { JwtStrategyClient } from './strategiesClient/jwt.clientStrategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client]),
    PassportModule.register({ defaultStrategy: 'jwtClient' }),
    JwtModule.registerAsync({
      useFactory: jwtConfig,
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthClientController],
  providers: [AuthClientService, JwtStrategyClient],
  exports: [AuthClientService, JwtModule, PassportModule, JwtStrategyClient],
})
export class AuthClientModule {}
