import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PushRecordService } from './push-record.service';
import { CreatePushRecordDto } from './dto/create-push-record.dto';
import { UpdatePushRecordDto } from './dto/update-push-record.dto';
import { PushRecordQueryRobotDto } from './dto/query-push-record.dto';
import { User } from '@/decorator/user.decorator';

@ApiTags('推送记录')
@Controller('push-record')
export class PushRecordController {
  constructor(private readonly pushRecordService: PushRecordService) {}

  @Post()
  create(@Body() createPushRecordDto: CreatePushRecordDto) {
    return this.pushRecordService.create(createPushRecordDto);
  }

  @Get()
  findAll() {
    return this.pushRecordService.findAll();
  }

  @Get('list')
  findWithQuery(@Query() query: PushRecordQueryRobotDto) {
    return this.pushRecordService.findListWithQuery(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pushRecordService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePushRecordDto: UpdatePushRecordDto,
  ) {
    return this.pushRecordService.update(+id, updatePushRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pushRecordService.remove(+id);
  }

  @Post('repush')
  repush(@Body() pushRecordDto: UpdatePushRecordDto) {
    return this.pushRecordService.repush(pushRecordDto);
  }
}
