import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

/**
 * Swagger 接口文档
 *
 * @export
 * @param {INestApplication} app
 */
export function swaggerSetup(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Work Tools APP API')
    .setVersion('1.0')
    // .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document);
}
