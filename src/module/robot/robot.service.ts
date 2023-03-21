import { In, Repository, Like } from 'typeorm';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import * as dayjs from 'dayjs';
import * as quarterOfYear from 'dayjs/plugin/quarterOfYear';
import { BaseService } from '@/common/service/base.service';
import {
  PushResultEnum,
  PushResultModuleEnum,
  RobotMessageTemplateEnum,
  StatusEnum,
} from '@/enum';
import { getPagination, getRobotMessageConfig } from '@/utils';
import { CreateRobotDto } from './dto/create-robot.dto';
import { UpdateRobotDto, UpdateRobotStatusDto } from './dto/update-robot.dto';
import { QueryRobot, ReportTypeRobotDto } from './dto/query-robot.dto';
import { Robot } from './entities/robot.entity';
import { Share } from '../share/entities/share.entity';
import { ShareService } from '../share/share.service';
import { PushRecordService } from '../push-record/push-record.service';
import { PushRecordResult } from '../push-record/entities/push-record.entity';

// 增强 dayjs
dayjs.extend(quarterOfYear);

@Injectable()
export class RobotService extends BaseService {
  constructor(
    @InjectRepository(Robot)
    private readonly robotRepository: Repository<Robot>,
    @Inject(forwardRef(() => ShareService))
    private readonly shareService: ShareService,
    @Inject(forwardRef(() => PushRecordService))
    private readonly pushRecordService: PushRecordService,
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

  findByIds(ids: number[]) {
    return this.robotRepository.findBy({
      id: In([ids]),
      status: Like(StatusEnum.NORMAL),
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
    const { page, size } = getPagination(query.page, query.size);
    qb.orderBy('robot.created_at', 'DESC')
      .skip(size * (page - 1))
      .take(size);

    const [list, total] = await qb.getManyAndCount();
    return {
      total,
      list,
      page,
      size,
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
   * @param {Partial<Share>[]} data
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

  /**
   *发送报告 (月份、季度)
   *
   * @param {ReportTypeRobotDto} query
   * @param {boolean} isRepush 是否是重新推
   * @memberof RobotService
   */
  async sendMessageReportForShare(query: ReportTypeRobotDto, isRepush = false) {
    const isMonthType = query.type === 'month';
    const curYear = dayjs().format('YYYY');
    const curVal = isMonthType ? dayjs().month() + 1 : dayjs().quarter();
    const templates = {
      month: RobotMessageTemplateEnum.MONTH,
      quarter: RobotMessageTemplateEnum.QUARTER,
    };

    query.year = query.year ?? Number(curYear);
    query.value = query.value ?? curVal;

    const title = isMonthType
      ? `【好文报告】${query.value}月份推荐`
      : `【好文报告】第${query.value}季度推荐`;

    // 1. 获取数据列表
    const data = await this.shareService.findListForReport(query);

    // 2. 获取配置
    const config = getRobotMessageConfig(templates[query.type], data, title);

    // 3. 获取要发送机器人集合
    let robots: Robot[];
    if (isRepush && (query.results ?? []).length > 0) {
      const ids = (query.results ?? []).map((r) => r.robot.id);
      robots = await this.findByIds(ids);
    } else {
      robots = await this.findAll();
    }

    // 4. 循环机器人集合发送信息, 并记录推送结果（新增记录+推送结果、更新推送结果）
    const pushResultList: Partial<PushRecordResult>[] = [];
    for (let i = 0; i < robots.length; i++) {
      const robot = robots[i];
      const res = await this.httpService.axiosRef.post<{ code: number }>(
        robot.webhook,
        config,
      );
      console.log('推送结果：', res.data);

      const isSuccess = res.data?.code === 0;
      const result = {
        id: isRepush ? query.results[i].id : null,
        robot,
        result: isSuccess ? PushResultEnum.SUCCESS : PushResultEnum.FAIL,
      };
      pushResultList.push(result);
    }

    const record = {
      title,
      module: PushResultModuleEnum.SHARE,
      variable: JSON.stringify(query),
    };

    if (isRepush) {
      return this.pushRecordService.updateResult(pushResultList);
    }

    return this.pushRecordService.create(record, pushResultList);
  }
}
