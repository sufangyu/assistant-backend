import { Dependencies, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { config } from './config/development';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShareModule } from './module/share/share.module';
import { CategoryModule } from './module/category/category.module';
import { TagModule } from './module/tag/tag.module';

// console.log('config', config.db);

@Dependencies(DataSource)
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3456,
      username: 'root',
      password: '123456',
      database: 'assistant',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: true, // 不能被用于生产环境, 可能会丢失生产环境数据
      logging: ['query', 'error'],
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
