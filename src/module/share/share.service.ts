import { Category } from '@/module/category/entities/category.entity';
import { UpdateShareDto } from './dto/update-share.dto';
import { Tag } from '@/module/tag/entities/tag.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@/common/service/base';
import { DataSource, In, Repository } from 'typeorm';
import { Share } from './entities/share.entity';
import { CreateShareDto } from './dto/create-share.dto';
import { CategoryService } from '../category/category.service';
import { TagService } from '../tag/tag.service';

@Injectable()
export class ShareService extends BaseService {
  constructor(
    @InjectRepository(Share)
    private readonly shareRepository: Repository<Share>,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
    private readonly dataSource: DataSource,
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
    // console.log('createShareDto: ', createShareDto);
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
      createShareDto.tags = await this.tagService.findMore(
        createShareDto.tagIds,
      );

      const result = await this.shareRepository.save(createShareDto);
      await queryRunner.commitTransaction();
      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  findAll(): Promise<Share[]> {
    // 多对一联表查询: https://juejin.cn/post/7026575644150464548
    // 多对多联表查询：https://cloud.tencent.com/developer/article/1962428
    const queryBuilder = this.shareRepository.createQueryBuilder('share');

    queryBuilder
      .leftJoinAndSelect('share.category', 'category')
      .leftJoinAndSelect('share.tags', 'tags')
      .select(['share.id', 'share.url', 'share.title'])
      .addSelect(['category.id', 'category.name'])
      .addSelect(['tags.id', 'tags.name'])
      .where({});

    return queryBuilder.getMany();
  }

  findOne(id: number) {
    return this.shareRepository.findOneBy({ id });
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

      console.log('update category, tags: ', category, tags);

      const { title, description } = updateShareDto;
      result.title = title;
      result.description = description;
      result.category = category;
      result.tags = tags;

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
}
