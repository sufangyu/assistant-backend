import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { load } from 'cheerio';
import { firstValueFrom } from 'rxjs';
import { BaseService } from '@/common/service/base';
import { Share } from './entities/share.entity';
import { CreateShareDto } from './dto/create-share.dto';
import { UpdateShareDto } from './dto/update-share.dto';
import { CategoryService } from '../category/category.service';
import { TagService } from '../tag/tag.service';
import { RobotService } from '../robot/robot.service';
import { ROBOT_MESSAGE_TEMPLATE } from '@/enums';
import { QueryShareDto } from './dto/query-share.dto';
import { ListBase } from '@/type';

@Injectable()
export class ShareService extends BaseService {
  constructor(
    @InjectRepository(Share)
    private readonly shareRepository: Repository<Share>,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
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

      console.log(createShareDto);

      const result = await this.shareRepository.save(createShareDto);
      await queryRunner.commitTransaction();

      // 机器人发送
      this.robotService.sendMessageForShare(
        createShareDto.robots,
        ROBOT_MESSAGE_TEMPLATE.EACH,
        [result],
      );

      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: QueryShareDto): Promise<ListBase<Share>> {
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

    // 分页
    qb.skip(query.size * (query.page - 1)).take(query.size);

    const [list, total] = await qb.getManyAndCount();
    return {
      total,
      list,
      page: query.page,
      size: query.size,
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
   * 按条件查询分组
   *
   * @param {('year' | 'quarter' | 'month')} type
   * @return {*}
   * @memberof ShareService
   */
  findAllGroup(year?: string): Promise<Share[]> {
    const queryBuilder = this.shareRepository.createQueryBuilder();

    queryBuilder
      .select([
        'id',
        'title',
        'created_at as createdAt',
        'YEAR(created_at) as year',
        'QUARTER(created_at) as quarter',
        'MONTH(created_at) as month',
      ])
      .where({});

    // 查询指定年份的数据
    if (year) {
      queryBuilder.andWhere('created_at BETWEEN :start AND :end', {
        start: `${year}-01-01 00:00:00`,
        end: `${year}-12-31 23:59:59`,
      });
    }
    queryBuilder.orderBy('created_at', 'ASC');

    return queryBuilder.getRawMany();
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
          is_del != 1
          AND
          DATE_FORMAT(created_at,'%Y') = ${year}
      GROUP BY
          value
      ORDER BY
          value asc;
    `);
    console.log('====================================');
    console.log(queryRes);
    console.log('====================================');

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
}
