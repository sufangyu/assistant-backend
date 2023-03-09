import { forwardRef, Module } from '@nestjs/common';
import { PushRecordService } from './push-record.service';
import { PushRecordController } from './push-record.controller';
import { PushRecord } from './entities/push-record.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RobotModule } from '../robot/robot.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PushRecord]),
    forwardRef(() => RobotModule),
  ],
  controllers: [PushRecordController],
  providers: [PushRecordService],
  exports: [PushRecordService],
})
export class PushRecordModule {}
