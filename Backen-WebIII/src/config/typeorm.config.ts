import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { join } from "path";

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
    type: "postgres",
    host: configService.get<string>("DB_HOST", 'localhost'),
    port: +configService.get<string>('DB_PORT', '5432'),
    username: configService.get<string>("DB_USERNAME", 'postgres'),
    password: configService.get<string>("DB_PASSWORD"),
    database: configService.get<string>("DB_NAME"),
    entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
    synchronize: configService.get<string>('NODE_ENV') === 'development' ? true : false,
})