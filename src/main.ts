import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filter/any-exception.filter';
import { AllResponseInterceptor } from './interceptor/all-response.interceptor';
import { ValidationPipe } from './pipe/validate.pipe';
import { logger } from './middleware/logger/logger.middleware';
import { swaggerSetup } from './plugins/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  swaggerSetup(app);

  // 跨域设置
  app.enableCors({
    credentials: true,
    origin(origin, callback) {
      console.log('origin >>', origin)
      callback(null, origin);
    },
  });

  // 验证 & 拦截器 & 过滤器
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new AllResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  app
    .use(express.json()) // For parsing application/json
    .use(express.urlencoded({ extended: true })) // For parsing application/x-www-form-urlencoded
    .use(logger);

  await app.listen(process.env.APP_PORT ?? 3000);
}

bootstrap();
