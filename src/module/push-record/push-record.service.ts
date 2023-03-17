import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@/common/service/base';
import { CreatePushRecordDto } from './dto/create-push-record.dto';
import { UpdatePushRecordDto } from './dto/update-push-record.dto';
import { PushRecord, PushRecordResult } from './entities/push-record.entity';
import { PushRecordQueryRobotDto } from './dto/query-push-record.dto';
import { PushResultModuleEnum, StatusEnum } from '@/enum';
import { RobotService } from '../robot/robot.service';
import { ReportTypeRobotDto } from '../robot/dto/query-robot.dto';
import { getPagination } from '@/utils';

@Injectable()
export class PushRecordService extends BaseService {
  constructor(
    @InjectRepository(PushRecord)
    private readonly pushRecordRepository: Repository<PushRecord>,
    @InjectRepository(PushRecordResult)
    private readonly pushRecordResultRepository: Repository<PushRecordResult>,
    @Inject(forwardRef(() => RobotService))
    private readonly robotService: RobotService,
  ) {
    super();
  }

  async create(
    createPushRecordDto: CreatePushRecordDto,
    pushResultList?: Partial<PushRecordResult>[],
  ) {
    // 写记录
    const record = await this.pushRecordRepository.save(createPushRecordDto);

    // 写结果
    const values = pushResultList.map((res) => {
      const recordResult = new PushRecordResult();
      recordResult.pushRecord = record;
      recordResult.robot = res.robot;
      recordResult.result = res.result;
      return recordResult;
    });
    const pushResult = await this.pushRecordResultRepository.save(values);
    record.results = JSON.parse(JSON.stringify(pushResult));
    return record;
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
    qb.leftJoinAndSelect('pushRecord.results', 'results')
      .leftJoinAndSelect('results.robot', 'robot')
      .select('pushRecord')
      .addSelect(['results'])
      .addSelect('robot')
      .andWhere('robot.status like :status', { status: StatusEnum.NORMAL });

    // 推送结果
    if (query.result) {
      qb.andWhere('results.result like :result', {
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
    const { page, size } = getPagination(query.page, query.size);
    qb.skip(size * (page - 1)).take(size);

    const [list, total] = await qb.getManyAndCount();
    return {
      total,
      list,
      page,
      size,
    };
  }

  findOne(id: number) {
    // return this.pushRecordRepository.findOneBy({ id });
    return this.pushRecordRepository.findOne({
      where: { id },
      relations: ['results', 'results.robot'],
    });
  }

  async update(id: number, updatePushRecordDto: UpdatePushRecordDto) {
    const result = await this.findOne(id);

    if (!result) {
      this.error('推送记录不存在');
    }

    return this.pushRecordRepository.update(+id, updatePushRecordDto);
  }

  /**
   * 更新推送结果
   *
   * @param {Partial<PushRecordResult>[]} results 推送结果集合
   * @memberof PushRecordService
   */
  async updateResult(results: Partial<PushRecordResult>[]) {
    // 更新推送记录
    const newResult = results.map((r) => {
      const result = new PushRecordResult();
      result.id = r.id;
      result.result = r.result;
      return result;
    });

    return this.pushRecordResultRepository.save(newResult);
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
          type,
          year,
          value,
          results: pushRecord.results,
        };
        await this.robotService.sendMessageReportForShare(query, true);
        break;
    }
  }
}
