import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { load } from 'cheerio';
import { firstValueFrom } from 'rxjs';
import * as dayjs from 'dayjs';
import * as quarterOfYear from 'dayjs/plugin/quarterOfYear';
import { BaseService } from '@/common/service/base.service';
import { RobotMessageTemplateEnum } from '@/enum';
import { ListBase } from '@/type';
import { Share } from './entities/share.entity';
import { CreateShareDto } from './dto/create-share.dto';
import { UpdateShareDto } from './dto/update-share.dto';
import { CategoryService } from '../category/category.service';
import { TagService } from '../tag/tag.service';
import { RobotService } from '../robot/robot.service';
import {
  QueryShareDto,
  QueryShareFiledDto,
  QueryShareTrendDto,
  TrendQueryDto,
} from './dto/query-share.dto';
import { getDatesByRange, getPagination } from '@/utils';
import { ReportTypeRobotDto } from '../robot/dto/query-robot.dto';

// 增强 dayjs
dayjs.extend(quarterOfYear);

@Injectable()
export class ShareService extends BaseService {
  constructor(
    @InjectRepository(Share)
    private readonly shareRepository: Repository<Share>,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
    @Inject(forwardRef(() => RobotService))
    private readonly robotService: RobotService,
    private readonly dataSource: DataSource,
    private readonly httpService: HttpService,
  ) {
    super();
  }

  /**
   * 创建 分享数据
   *
   * @param {CreateShareDto} createShareDto
   * @return {*}
   * @memberof ShareService
   */
  async create(createShareDto: CreateShareDto): Promise<Share> {
    console.log('createShareDto: ', createShareDto);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // 多对多数据保存：https://cloud.tencent.com/developer/article/1962428
    // 多对多数据保存：https://www.jianshu.com/p/aa3badabc257 [!!!]
    try {
      createShareDto.category = await this.categoryService.findOne(
        createShareDto.categoryId,
      );

      // 通过标签 ID 集合，查处对应的 entities 示例
      // 同时赋值给 ShareDto 的 tags 参数, 用于给 share_tag_id 表添加数据
      if ((createShareDto.tagIds ?? []).length > 0) {
        createShareDto.tags = await this.tagService.findMore(
          createShareDto.tagIds,
        );
      }

      // 机器人
      if (createShareDto.robotIds ?? []) {
        createShareDto.robots = await this.robotService.findMore(
          createShareDto.robotIds,
        );
      }
      // console.log(createShareDto);

      const result = await this.shareRepository.save(createShareDto);
      await queryRunner.commitTransaction();

      // 机器人发送
      this.robotService.sendMessageForShare(
        createShareDto.robots,
        RobotMessageTemplateEnum.EACH,
        [result],
      );

      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async findListWithQuery(query: QueryShareDto): Promise<ListBase<Share>> {
    // console.log('query: ', query);
    // 多对一联表查询: https://juejin.cn/post/7026575644150464548
    // 多对多联表查询：https://cloud.tencent.com/developer/article/1962428
    const qb = this.shareRepository.createQueryBuilder('share');
    qb.leftJoinAndSelect('share.category', 'category')
      .leftJoinAndSelect('share.tags', 'tags')
      .leftJoinAndSelect('share.robots', 'robots')
      .select([
        'share.id',
        'share.url',
        'share.title',
        'share.description',
        'share.createdAt',
      ])
      .addSelect('share.created_at', 'createdAt')
      .addSelect(['category.id', 'category.name'])
      .addSelect(['tags.id', 'tags.name'])
      .addSelect(['robots.id', 'robots.name', 'robots.webhook']);

    // 分类
    if (query.categoryId) {
      // qb.andWhere('share.category = :id', { id: query.categoryId });
      qb.andWhere('category.id = :id', { id: query.categoryId });
    }

    // 标签
    if (query.tagIds) {
      const tagIds = [...query.tagIds].map((it) => +it);
      qb.andWhere('tags.id IN(:...ids)', { ids: tagIds });
    }

    // 时间查询
    if (query.start && query.end) {
      qb.andWhere('share.created_at BETWEEN :start AND :end', {
        start: query.start ?? '',
        end: query.end ?? '',
      });
    }

    // 分页. 一页最多查 100 条数据; 默认查10条
    const { page, size } = getPagination(query.page, query.size);
    qb.orderBy('createdAt', 'DESC')
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
    const qb = this.shareRepository.createQueryBuilder('share');
    qb.leftJoinAndSelect('share.category', 'category')
      .leftJoinAndSelect('share.tags', 'tags')
      .leftJoinAndSelect('share.robots', 'robots')
      .select([
        'share.id',
        'share.url',
        'share.title',
        'share.description',
        'share.createdAt',
      ])
      .addSelect(['category.id', 'category.name'])
      .addSelect(['tags.id', 'tags.name'])
      .addSelect(['robots.id', 'robots.name', 'robots.type', 'robots.webhook'])
      .where({ id });

    return qb.getOne();
  }

  async update(id: number, updateShareDto: UpdateShareDto) {
    const result = await this.findOne(id);

    if (!result) {
      this.error('分类数据不存在');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const category = await this.categoryService.findOne(
        updateShareDto.categoryId,
      );
      // 通过标签 ID 集合，查处对应的 entities 示例,
      // 同时赋值给 ShareDto 的 tags 参数, 用于给 share_tag_id 表添加数据
      const tags = await this.tagService.findMore(updateShareDto.tagIds);

      const robots = await this.robotService.findMore(updateShareDto.robotIds);

      const { title, description } = updateShareDto;
      result.title = title;
      result.description = description;
      result.category = category;
      result.tags = tags;
      result.robots = robots;

      return result.save();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const result = await this.shareRepository.findOne({
      where: { id },
    });

    if (!result) {
      this.error('分享内容不存在');
    }

    return this.shareRepository.softRemove(result);
  }

  /**
   * 按条件归档查询
   *
   * @param {QueryShareFiledDto} query
   * @return {*}
   * @memberof ShareService
   */
  async findAllFiled(query: QueryShareFiledDto) {
    const curYear = dayjs().format('YYYY');
    // console.log(curYear);
    const { type, year = curYear } = query;
    const qb = this.shareRepository.createQueryBuilder();

    qb.select([
      'id',
      'url',
      'title',
      'description',
      `DATE_FORMAT(created_at,'%Y-%m-%d') AS createdAt`,
      'YEAR(created_at) AS year',
      'QUARTER(created_at) AS quarter',
      'MONTH(created_at) AS month',
    ])
      .where('created_at BETWEEN :start AND :end', {
        start: `${year}-01-01 00:00:00`,
        end: `${year}-12-31 23:59:59`,
      })
      .orderBy('created_at', 'ASC');

    const rawResult = await qb.getRawMany();
    // console.log(rawResult);

    const resultFiled = {};
    (rawResult ?? []).forEach((it) => {
      const key = it[type];
      if (!resultFiled[key]) {
        resultFiled[key] = {
          type,
          label: it[type],
          list: [],
        };
      }

      resultFiled[key].list.push({
        id: it.id,
        title: it.title,
        url: it.url,
        description: it.description,
        createdAt: it.createdAt,
      });
    });

    return Object.values(resultFiled);
  }

  async findByQuery(query) {
    const { year = '2023' } = query;
    return this.totalByQuarterOrMonth(year);
  }

  /**
   *  根据季度/月份统计数据
   *
   * @param {string} year
   * @param {('QUARTER' | 'MONTH')} [type='MONTH']
   * @return {*}
   * @memberof ShareService
   */
  async totalByQuarterOrMonth(
    year: string,
    type: 'QUARTER' | 'MONTH' = 'MONTH',
  ) {
    const TYPE_MAP = {
      QUARTER: {
        func: 'QUARTER',
        alias: 'quarter',
        full: ['1', '2', '3', '4'],
      },
      MONTH: {
        func: 'MONTH',
        alias: 'month',
        full: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      },
    };
    const queryFunc = TYPE_MAP[type].func;
    const alias = TYPE_MAP[type].alias;
    const fullData = TYPE_MAP[type].full;

    const queryRes = await this.shareRepository.query(`
      SELECT
          ${queryFunc}(created_at) AS value,
          count(*) AS total
      FROM
          share
      WHERE
          DATE_FORMAT(created_at,'%Y') = ${year}
      GROUP BY
          value
      ORDER BY
          value asc;
    `);
    console.log('queryRes: ', queryRes);
    // [
    //   { value: 1, total: '8' },
    //   { value: 2, total: '2' },
    //   { value: 4, total: '5' }
    // ]

    // 处理补全缺失的季度数据
    const total = fullData.map((q) => {
      const item = queryRes.find((t) => t.value == q);
      let data = { [`${alias}`]: q, total: 0 };
      if (item) {
        data = {
          [`${alias}`]: q,
          total: Number(item.total),
        };
      }
      return data;
    });

    return total;
  }

  /**
   * 统计近2年/2个月数据
   *
   * @memberof ShareService
   */
  async totalRecent(type: 'year' | 'month') {
    // const now = '2022-1-06';
    const formatStr = type === 'year' ? 'YYYY' : 'YYYY-MM';
    const formatStrSql = type === 'year' ? '%Y' : '%Y-%m';
    const current = dayjs().format(formatStr);
    const prev = dayjs().subtract(1, type).format(formatStr);
    const recentTotal = {
      [current]: 0,
      [prev]: 0,
    };
    const qb = this.shareRepository.createQueryBuilder('share');
    qb.select([
      `DATE_FORMAT(created_at, '${formatStrSql}') as type`,
      'COUNT(*) as total',
    ])
      .where(
        `DATE_FORMAT(created_at, '${formatStrSql}') BETWEEN :start AND :end`,
        {
          start: prev,
          end: current,
        },
      )
      .groupBy(`type`);
    const rawRes: { type: string; total: number }[] = await qb.getRawMany();
    // console.log(qb.getSql());
    // console.log(rawRes);

    (rawRes ?? []).forEach((it) => {
      recentTotal[it.type] = Number(it.total) ?? 0;
    });
    // console.log('recentTotal:', recentTotal);

    return {
      prev: recentTotal[prev],
      current: recentTotal[current],
      type,
    };
  }

  /**
   * 数据趋势（7day、14day、30day）
   *
   * 原生SQL实现: https://cloud.tencent.com/developer/article/1911200
   *
   * @param {TrendQueryDto} query
   * @return {*}
   * @memberof ShareService
   */
  async trend(query: TrendQueryDto) {
    const formatStr = 'YYYY-MM-DD';
    const OFFSET_MAP = {
      '7day': 7,
      '14day': 14,
      '30day': 30,
    };
    const start = dayjs()
      .subtract(OFFSET_MAP[query.type], 'day')
      .format(formatStr);
    const end = dayjs().subtract(1, 'day').format(formatStr);

    // 生成指定的日期列表（数组 => 对象）
    const datesRange = getDatesByRange(start, end);
    const resultObj = Object.create(null);
    datesRange.forEach((date) => (resultObj[date] = 0));

    const qb = this.shareRepository.createQueryBuilder('share');
    qb.select([
      `DATE_FORMAT(created_at, '%Y-%m-%d') AS date`,
      'COUNT(*) AS total',
    ])
      .where(`DATE_FORMAT(created_at, '%Y-%m-%d') BETWEEN :start AND :end`, {
        start,
        end,
      })
      .groupBy(`date`);

    // 循环查询结果, 赋值有统计到的结果
    const rawData = await qb.getRawMany<{ date: string; total: number }>();
    rawData.forEach((it) => (resultObj[it.date] = Number(it.total)));
    // console.log(resultObj);

    // 转换格式返回
    return Object.keys(resultObj).map((k) => ({
      date: k,
      total: resultObj[k],
    }));
  }

  /**
   * 趋势同比（季度/月度）
   *
   * @param {QueryShareTrendDto} query
   * @return {*}
   * @memberof ShareService
   */
  async trendYearOverYear(query: QueryShareTrendDto, year: string) {
    const qb = this.shareRepository.createQueryBuilder('share');
    qb.select([
      'COUNT(share.id) AS total',
      `${query.type}(share.created_at) as ${query.type}`,
    ])
      .andWhere('created_at BETWEEN :start AND :end', {
        start: `${year}-01-01 00:00:00`,
        end: `${year}-12-31 23:59:59`,
      })
      .groupBy(query.type)
      .orderBy(query.type, 'ASC');

    const rawResult = await qb.getRawMany();
    // console.log(rawResult);

    // 处理补全内容
    const FULL_MAP = {
      quarter: ['1', '2', '3', '4'],
      month: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    };
    const result = (FULL_MAP[query.type] ?? []).map((it) => {
      let data = { [`${query.type}`]: Number(it), total: 0 };
      const item = rawResult.find((t) => t[`${query.type}`] === Number(it));
      if (item) {
        data = {
          [`${query.type}`]: Number(it),
          total: Number(item.total),
        };
      }
      return data;
    });

    return result;
  }

  /**
   * 分类汇总
   *
   * @param {string} [year]
   * @return {*}
   * @memberof ShareService
   */
  async pipCategory(year?: string) {
    const curYear = year ?? dayjs().format('YYYY');

    // 原生 SQL 语句
    // select count(s.created_at) as total, s.category_id, ifnull(c.name, '未知') as name
    // from share s
    //     left join category c on c.id = s.category_id
    // where YEAR(s.created_at) = YEAR(curdate())
    //   and s.deleted_at is null
    // group by s.category_id
    const qb = this.shareRepository.createQueryBuilder('share');
    qb.leftJoinAndSelect('share.category', 'category')
      .where(`YEAR(share.created_at) = :year`, { year: curYear })
      .select([
        'COUNT(share.created_at) as value',
        `IFNULL(category.name, '未知') as name`,
        'share.category_id',
      ])
      .groupBy('share.category');
    // console.log(qb.getSql());

    // const count = await qb.getCount();
    const res = await qb.getRawMany();
    return res;
  }

  /**
   * 机器人汇总
   *
   * @param {string} [year]
   * @return {*}
   * @memberof ShareService
   */
  async pipRobot(year?: string) {
    const curYear = year ?? dayjs().format('YYYY');

    // 原生 SQL
    // SELECT count(s.id) as value, ifnull(r.name, '未知') as name, sri.robot_id
    // FROM share s
    //     LEFT JOIN share_robot_id sri ON s.id = sri.share_id
    //     LEFT JOIN robot r ON r.id = sri.robot_id
    // WHERE YEAR(s.created_at) = YEAR(curdate()) AND s.deleted_at is null
    // GROUP BY sri.robot_id
    const qb = this.shareRepository.createQueryBuilder('share');
    qb.leftJoinAndSelect('share_robot_id', 'sri', 'share.id = sri.share_id')
      .leftJoinAndSelect('robot', 'robot', 'robot.id = sri.robot_id')
      .where(`YEAR(share.created_at) = :year`, { year: curYear })
      .select([
        'COUNT(share.id) as value',
        `IFNULL(robot.name, '未知') as name`,
        'robot.id',
      ])
      .groupBy('sri.robot_id');
    // console.log(qb.getSql());

    const res = await qb.getRawMany();
    // console.log(count, res);
    return res;
  }

  /**
   * 标签汇总
   *
   * @param {string} [year]
   * @return {*}
   * @memberof ShareService
   */
  async pipTag(year?: string) {
    const curYear = year ?? dayjs().format('YYYY');

    // 原生 SQL
    // SELECT COUNT(s.id) as value, ifnull(t.name, '未知') as name, t.id
    // FROM share s
    //         LEFT JOIN share_tag_id sti on s.id = sti.share_id
    //         LEFT JOIN tag t on t.id = sti.tag_id
    // WHERE YEAR(s.created_at) = YEAR(curdate()) AND s.deleted_at is null
    // GROUP BY t.id
    const qb = this.shareRepository.createQueryBuilder('share');
    qb.leftJoinAndSelect('share_tag_id', 'sti', 'share.id = sti.share_id')
      .leftJoinAndSelect('tag', 'tag', 'tag.id = sti.tag_id')
      .where(`YEAR(share.created_at) = :year`, { year: curYear })
      .select([
        'COUNT(share.id) as value',
        `IFNULL(tag.name, '未知') as name`,
        'tag.id',
      ])
      .groupBy('tag.id');
    // console.log(qb.getSql());

    const res = await qb.getRawMany();
    // console.log(count, res);
    return res;
  }

  /**
   * 获取网站信息
   *
   * @param {string} url
   * @memberof ShareService
   */
  async getWebsiteInfo(url: string) {
    // FIXME: https://typeorm.io/many-to-many-relations => 请求 404
    const webUrl = decodeURIComponent(url);
    const UA =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36';
    const { data } = await firstValueFrom<AxiosResponse>(
      this.httpService.get(webUrl, { headers: { 'User-Agent': UA } }),
    );

    const $ = load(data);
    let title = $('title').text();
    let description = $('meta[name=description]').attr('content');

    if (webUrl.includes('mp.weixin.qq.com')) {
      // 微信公众号
      title = $('meta[property=og:title]').attr('content');
      description = $('meta[property=og:description]').attr('content');
    }

    return { title, description };
  }

  async findListForReport(query: ReportTypeRobotDto): Promise<Share[]> {
    const { type, year, value } = query;
    const qb = this.shareRepository.createQueryBuilder('share');
    qb.select().where(
      `DATE_FORMAT(created_at, '%Y') = :year AND ${type}(created_at) = :math`,
      {
        year,
        math: value,
      },
    );

    return qb.getMany();
  }
}
