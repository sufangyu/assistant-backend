import { Dependencies, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShareModule } from './module/share/share.module';
import { CategoryModule } from './module/category/category.module';
import { TagModule } from './module/tag/tag.module';

// console.log('config', config.db);
console.log('process.env.NODE_ENV:', process.env.NODE_ENV);

@Dependencies(DataSource)
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === 'development', // 不能被用于生产环境, 可能会丢失生产环境数据
      logging: ['error'],
    }),
    ShareModule,
    CategoryModule,
    TagModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }
}
