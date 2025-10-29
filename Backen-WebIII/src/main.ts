import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Servir archivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });


  const logger = new Logger(AppModule.name);

  const configService = app.get(ConfigService);

  //Global Exception Filter = maneja TODOS los errores
  app.useGlobalFilters(new AllExceptionsFilter());


  //Glopal prefix desde el archivo .env
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1')
  app.setGlobalPrefix(apiPrefix);

  //global validation pipe para DTOs 
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    disableErrorMessages: false,
    validationError: {
      target: false,
      value: false,
    },
  }),
  );


  //iniciar el servidor 
  const port = configService.get<string>('PORT', '3001');
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`API Base URL: http://localhost:${port}/${apiPrefix}`)
}
bootstrap();
