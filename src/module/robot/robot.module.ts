import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RobotService } from './robot.service';
import { RobotController } from './robot.controller';
import { Robot } from './entities/robot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Robot])],
  controllers: [RobotController],
  providers: [RobotService],
})
export class RobotModule {}
