import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShareService } from './share.service';
import { ShareController } from './share.controller';
import { Share } from './entities/share.entity';
import { CategoryModule } from '../category/category.module';
import { TagModule } from '../tag/tag.module';

@Module({
  imports: [TypeOrmModule.forFeature([Share]), CategoryModule, TagModule],
  controllers: [ShareController],
  providers: [ShareService],
})
export class ShareModule {}
