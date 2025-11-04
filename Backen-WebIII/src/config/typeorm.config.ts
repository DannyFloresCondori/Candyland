import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { join } from "path";

export const typeOrmConfig = (
    configService: ConfigService
): TypeOrmModuleOptions => ({
    type: "postgres",

    // ✅ usa DATABASE_URL si está definida (Render la usa)
    url: configService.get<string>("DATABASE_URL"),
    host: configService.get<string>("DB_HOST","dpg-d41l7gfgi27c739kshsg-a.oregon-postgres.render.com"),
    port: +configService.get<string>("DB_PORT", "5432"),
    username: configService.get<string>("DB_USERNAME","candyland_db_user"),
    password: configService.get<string>("DB_PASSWORD"),
    database: configService.get<string>("DB_NAME"),
    entities: [join(__dirname, "../**/*.entity{.ts,.js}")],
    synchronize:
        configService.get<string>("NODE_ENV") === "development" ? true : false,

    // ✅ muy importante: Render requiere SSL
    ssl: {
        rejectUnauthorized: false, // No validar certificado
    },

    // ✅ adicional para driver pg
    extra: {
        ssl: true,
    },
});
