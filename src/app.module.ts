import { Dependencies, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksService } from './schedule/tasks.service';
import { ShareModule } from './module/share/share.module';
import { CategoryModule } from './module/category/category.module';
import { TagModule } from './module/tag/tag.module';
import { RobotModule } from './module/robot/robot.module';
import { PushRecordModule } from './module/push-record/push-record.module';
import { UserModule } from './module/user/user.module';
import { JwtAuthGuard } from './guard/auth.guard';
import { AuthModule } from './module/auth/auth.module';
import { TypeOrmConfigService } from './config/typeorm.config';

console.log('process.env.NODE_ENV:', process.env.NODE_ENV);

@Dependencies(DataSource)
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
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
  ],
})
export class AppModule {
  dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }
}
