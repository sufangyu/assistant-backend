import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ShareService } from './share.service';
import { ShareController } from './share.controller';
import { Share } from './entities/share.entity';
import { CategoryModule } from '../category/category.module';
import { TagModule } from '../tag/tag.module';
import { RobotModule } from '../robot/robot.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Share]),
    CategoryModule,
    TagModule,
    RobotModule,
    HttpModule,
  ],
  controllers: [ShareController],
  providers: [ShareService],
})
export class ShareModule {}
