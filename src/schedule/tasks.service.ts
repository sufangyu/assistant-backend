import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RobotService } from '@/module/robot/robot.service';

@Injectable()
export class TasksService {
  constructor(private readonly robotService: RobotService) {}

  @Cron('0 0 17 1 * *')
  handleCronOnEveryMonthFirstDay() {
    // console.log('每月1号下午5点运行一次');
    this.robotService.sendMessageReportForShare({ type: 'month' });
  }

  // @Cron('30 * * * * *')
  // handleCronOnMinute() {
  //   // console.log('每分钟第三十秒运行一次');
  //   this.robotService.sendMessageReportForShare({ type: 'month' });
  // }
}
