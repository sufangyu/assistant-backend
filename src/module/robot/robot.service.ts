import { StatusEnum } from './../../enum/status.enum';
import { In, Repository, Like } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { BaseService } from '@/common/service/base';
import { RobotMessageTemplateEnum } from '@/enum';
import { getRobotMessageConfig } from '@/utils';
import { CreateRobotDto } from './dto/create-robot.dto';
import { UpdateRobotDto, UpdateRobotStatusDto } from './dto/update-robot.dto';
import { Robot } from './entities/robot.entity';
import { Share } from '../share/entities/share.entity';
import { QueryRobot } from './dto/query-robot.dto';

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
    return this.robotRepository.find({
      where: { status: Like(StatusEnum.NORMAL) },
    });
  }

  /**
   * 列表分页查询
   *
   * @param {QueryRobot} query
   * @return {*}
   * @memberof RobotService
   */
  async findListWithQuery(query: QueryRobot) {
    const qb = this.robotRepository.createQueryBuilder('robot');

    // 名称模糊查询
    if (query.name) {
      qb.andWhere('robot.name like :name', { name: `%${query.name}%` });
    }

    if (query.type) {
      qb.andWhere('robot.type = :type', { type: query.type });
    }

    if (query.status) {
      qb.andWhere('robot.status like :status', { status: `${query.status}` });
    }

    // 时间查询
    if (query.start && query.end) {
      qb.andWhere('robot.created_at BETWEEN :start AND :end', {
        start: query.start ?? '',
        end: query.end ?? '',
      });
    }

    // 分页. 一页最多查 100 条数据; 默认查10条
    const size = query.size ? Math.min(query.size, 100) : 10;
    qb.skip(size * (query.page - 1)).take(size);

    const [list, total] = await qb.getManyAndCount();
    return {
      total,
      list,
      page: query.page,
      size: size,
    };
  }

  findOne(id: number) {
    return this.robotRepository.findOneBy({ id });
  }

  findMore(ids: number[]) {
    return this.robotRepository.findBy({
      id: In(ids),
      status: Like(StatusEnum.NORMAL),
    });
  }

  async update(id: number, updateRobotDto: UpdateRobotDto) {
    const result = await this.findOne(id);

    if (!result) {
      this.error('机器人不存在');
    }

    return this.robotRepository.update(+id, updateRobotDto);
  }

  async updateStatus(id: number, updateRobotStatusDto: UpdateRobotStatusDto) {
    const result = await this.findOne(id);

    if (!result) {
      this.error('机器人不存在');
    }

    result.status = updateRobotStatusDto.status;
    return this.robotRepository.update(+id, result);
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
   * @param {RobotMessageTemplateEnum} template
   * @memberof RobotService
   */
  async sendMessageForShare(
    robots: Partial<Robot>[] = [],
    template: RobotMessageTemplateEnum,
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
