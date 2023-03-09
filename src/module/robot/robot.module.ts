import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { RobotService } from './robot.service';
import { RobotController } from './robot.controller';
import { Robot } from './entities/robot.entity';
import { ShareModule } from '../share/share.module';
import { PushRecordModule } from '../push-record/push-record.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Robot]),
    forwardRef(() => ShareModule),
    forwardRef(() => PushRecordModule),
    HttpModule,
  ],
  controllers: [RobotController],
  providers: [RobotService],
  exports: [RobotService],
})
export class RobotModule {}
