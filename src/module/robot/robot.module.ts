import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { RobotService } from './robot.service';
import { RobotController } from './robot.controller';
import { Robot } from './entities/robot.entity';
import { ShareModule } from '../share/share.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Robot]),
    forwardRef(() => ShareModule),
    HttpModule,
  ],
  controllers: [RobotController],
  providers: [RobotService],
  exports: [RobotService],
})
export class RobotModule {}
