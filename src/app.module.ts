import { Dependencies, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@chenjm/nestjs-redis';
import { ScheduleModule } from '@nestjs/schedule';
import { resolve } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmConfigService } from './config';
import { TasksService } from './schedule/tasks.service';
import { ShareModule } from './module/share/share.module';
import { CategoryModule } from './module/category/category.module';
import { TagModule } from './module/tag/tag.module';
import { RobotModule } from './module/robot/robot.module';
import { PushRecordModule } from './module/push-record/push-record.module';
import { UserModule } from './module/user/user.module';
import { JwtAuthGuard } from './guard/auth.guard';
import { AuthModule } from './module/auth/auth.module';
import { CacheService } from './common/service/cache.service';

console.log('process.env:', process.env);

@Dependencies(DataSource)
@Module({
  imports: [
    ConfigModule.forRoot({
      // envFilePath: resolve(__dirname, '../', `.env.${process.env.NODE_ENV}`),
      envFilePath: `.env.${process.env.NODE_ENV}`,
      ignoreEnvFile: process.env.NODE_ENV !== 'development',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    RedisModule.forRootAsync({
      useFactory: () => {
        return {
          closeClient: true,
          readyLog: true,
          config: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT),
            password: process.env.REDIS_PASSWORD,
            db: 0, // default,
            keyPrefix: process.env.REDIS_PREFIX,
          },
        };
      },
    }),
    ScheduleModule.forRoot(),
    ShareModule,
    CategoryModule,
    TagModule,
    RobotModule,
    PushRecordModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    AppService,
    TasksService,
    CacheService,
  ],
})
export class AppModule {
  dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }
}
