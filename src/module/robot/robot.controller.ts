import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RobotService } from './robot.service';
import { CreateRobotDto } from './dto/create-robot.dto';
import { UpdateRobotDto } from './dto/update-robot.dto';

@Controller('robot')
export class RobotController {
  constructor(private readonly robotService: RobotService) {}

  @Post()
  create(@Body() createRobotDto: CreateRobotDto) {
    return this.robotService.create(createRobotDto);
  }

  @Get()
  findAll() {
    return this.robotService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.robotService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRobotDto: UpdateRobotDto) {
    return this.robotService.update(+id, updateRobotDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.robotService.remove(+id);
  }

  @Post('send')
  // TEST
  sendMessage() {
    const robots = [
      {
        id: 1,
        name: 'Web群',
        type: 1,
        webhook:
          'https://open.feishu.cn/open-apis/bot/v2/hook/b633b1fe-f15c-4a8b-b9ad-1b595e42a263',
      },
      {
        id: 2,
        name: '移动群',
        type: 1,
        webhook:
          'https://open.feishu.cn/open-apis/bot/v2/hook/b633b1fe-f15c-4a8b-b9ad-1b595e42a263',
      },
    ];
    const template = 1;
    const share = { url: '标题', title: 'xxx', description: 'yyy' };
    return this.robotService.sendMessageForShare(robots, template, [share]);
  }
}
