import { In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { BaseService } from '@/common/service/base';
import { ROBOT_MESSAGE_TEMPLATE } from '@/enums';
import { getRobotMessageConfig } from '@/utils';
import { CreateRobotDto } from './dto/create-robot.dto';
import { UpdateRobotDto } from './dto/update-robot.dto';
import { Robot } from './entities/robot.entity';
import { Share } from '../share/entities/share.entity';

@Injectable()
export class RobotService extends BaseService {
  constructor(
    @InjectRepository(Robot)
    private readonly robotRepository: Repository<Robot>,
    private readonly httpService: HttpService,
  ) {
    super();
  }

  create(createRobotDto: CreateRobotDto) {
    return this.robotRepository.save(createRobotDto);
  }

  findAll() {
    return this.robotRepository.find();
  }

  findOne(id: number) {
    return this.robotRepository.findOneBy({ id });
  }

  findMore(ids: number[]) {
    return this.robotRepository.findBy({ id: In(ids) });
  }

  async update(id: number, updateRobotDto: UpdateRobotDto) {
    const result = await this.findOne(id);

    if (!result) {
      this.error('机器人不存在');
    }

    return this.robotRepository.update(+id, updateRobotDto);
  }

  async remove(id: number) {
    const result = await this.findOne(id);

    if (!result) {
      this.error('机器人不存在');
    }

    return this.robotRepository.softRemove(result);
  }

  /**
   * 发送信息
   *
   * @param {Partial<Robot>[]} robots
   * @param {ROBOT_MESSAGE_TEMPLATE} template
   * @memberof RobotService
   */
  async sendMessageForShare(
    robots: Partial<Robot>[] = [],
    template: ROBOT_MESSAGE_TEMPLATE,
    data: Partial<Share>[],
  ) {
    // console.log(robots, template, data);
    const config = getRobotMessageConfig(template, data);

    for (let i = 0; i < robots.length; i++) {
      const robot = robots[i];
      const res = await this.httpService.axiosRef.post(robot.webhook, config);
      console.log(robot.webhook, template, res.data);
    }
  }
}
