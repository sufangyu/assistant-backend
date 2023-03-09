import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@/common/service/base';
import { CreatePushRecordDto } from './dto/create-push-record.dto';
import { UpdatePushRecordDto } from './dto/update-push-record.dto';
import { PushRecord } from './entities/push-record.entity';
import { PushRecordQueryRobotDto } from './dto/query-push-record.dto';
import { PushResultModuleEnum } from '@/enum';
import { RobotService } from '../robot/robot.service';
import { ReportTypeRobotDto } from '../robot/dto/query-robot.dto';

@Injectable()
export class PushRecordService extends BaseService {
  constructor(
    @InjectRepository(PushRecord)
    private readonly pushRecordRepository: Repository<PushRecord>,
    @Inject(forwardRef(() => RobotService))
    private readonly robotService: RobotService,
  ) {
    super();
  }

  create(createPushRecordDto: CreatePushRecordDto) {
    return this.pushRecordRepository.save(createPushRecordDto);
  }

  findAll() {
    return this.pushRecordRepository.find();
  }
  /**
   * 列表分页查询
   *
   * @param {PushRecordQueryRobotDto} query
   * @return {*}
   * @memberof RobotService
   */
  async findListWithQuery(query: PushRecordQueryRobotDto) {
    const qb = this.pushRecordRepository.createQueryBuilder('pushRecord');

    // 推送结果
    if (query.result) {
      qb.andWhere('pushRecord.result like :result', {
        result: `${query.result}`,
      });
    }

    // 时间查询
    if (query.start && query.end) {
      qb.andWhere('pushRecord.created_at BETWEEN :start AND :end', {
        start: query.start ?? '',
        end: query.end ?? '',
      });
    }

    // 分页. 一页最多查 100 条数据; 默认查10条
    const size = query.size ? Math.min(query.size, 100) : 10;
    const page = query.page ?? 1;
    qb.skip(size * (page - 1)).take(size);
    // console.log(qb.getSql());

    const [list, total] = await qb.getManyAndCount();
    return {
      total,
      list,
      page,
      size,
    };
  }

  findOne(id: number) {
    return this.pushRecordRepository.findOneBy({ id });
  }

  async update(id: number, updatePushRecordDto: UpdatePushRecordDto) {
    const result = await this.findOne(id);

    if (!result) {
      this.error('推送记录不存在');
    }

    return this.pushRecordRepository.update(+id, updatePushRecordDto);
  }

  async remove(id: number) {
    const result = await this.findOne(id);

    if (!result) {
      this.error('推送记录不存在');
    }

    return this.pushRecordRepository.softRemove(result);
  }

  /**
   * 重新推送
   *
   * @param {CreatePushRecordDto} pushRecord
   * @memberof PushRecordService
   */
  async repush(pushRecord: UpdatePushRecordDto) {
    switch (pushRecord.module) {
      case `${PushResultModuleEnum.SHARE}`:
        const { type, year, value } = JSON.parse(pushRecord.variable) ?? {};
        console.log('推送功能模块：分享，参数', type, year, value);
        const query: ReportTypeRobotDto = {
          id: pushRecord.id,
          type: type,
          year: year,
          value: value,
        };
        this.robotService.sendMessageReportForShare(query, true);
        break;
    }
  }
}
