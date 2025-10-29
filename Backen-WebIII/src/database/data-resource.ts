import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Carga las variables de entorno desde tu archivo .env
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT!,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: process.env.NODE_ENV === 'development', // Sincronización automática solo en desarrollo
  logging: false,
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')], // Asegúrate de que esta ruta sea correcta
  migrations: [],
  subscribers: [],
});