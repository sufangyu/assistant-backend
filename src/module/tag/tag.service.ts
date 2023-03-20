import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BaseService } from '@/common/service/base';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { QueryTag } from './dto/query-tag.dto';
import { getPagination } from '@/utils';

@Injectable()
export class TagService extends BaseService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {
    super();
  }

  create(createTagDto: CreateTagDto) {
    return this.tagRepository.save(createTagDto);
  }

  findAll() {
    return this.tagRepository.find();
  }

  /**
   * 列表分页查询
   *
   * @param {QueryTag} query
   * @return {*}
   * @memberof TagService
   */
  async findListWithQuery(query: QueryTag) {
    const qb = this.tagRepository.createQueryBuilder('tag');

    // 名称模糊查询
    if (query.name) {
      qb.andWhere('tag.name like :name', { name: `%${query.name}%` });
    }

    // 时间查询
    if (query.start && query.end) {
      qb.andWhere('tag.created_at BETWEEN :start AND :end', {
        start: query.start ?? '',
        end: query.end ?? '',
      });
    }

    // 分页. 一页最多查 100 条数据; 默认查10条
    const { page, size } = getPagination(query.page, query.size);
    qb.orderBy('tag.created_at', 'DESC')
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
    return this.tagRepository.findOneBy({ id });
  }

  findMore(ids: number[]) {
    return this.tagRepository.findBy({ id: In(ids) });
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    const result = await this.findOne(id);

    if (!result) {
      this.error('标签不存在');
    }
    return this.tagRepository.update(id, updateTagDto);
  }

  async remove(id: number) {
    const result = await this.tagRepository.findOne({
      where: { id },
      // relations: ['share'], // TODO: 分类软删除, 是否需要更新文章的数据 ???
    });
    if (!result) {
      this.error('标签不存在');
    }

    return this.tagRepository.softRemove(result);
  }
}
