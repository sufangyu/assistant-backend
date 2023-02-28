import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filter/any-exception.filter';
import { AllResponseInterceptor } from './interceptor/all-response.interceptor';
import { ValidationPipe } from './pipe/validate.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 跨域设置
  app.enableCors({
    credentials: true,
    origin(origin, callback) {
      callback(null, true);
    },
  });

  // 验证 & 拦截器 & 过滤器
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new AllResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(3000);
}

bootstrap();
