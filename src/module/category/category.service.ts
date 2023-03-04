import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@/common/service/base';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategory } from './dto/query-category.dto';

@Injectable()
export class CategoryService extends BaseService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {
    super();
  }

  create(createCategoryDto: CreateCategoryDto) {
    return this.categoryRepository.save(createCategoryDto);
  }

  findAll() {
    return this.categoryRepository.find();
  }

  /**
   * 列表分页查询
   *
   * @param {QueryCategory} query
   * @return {*}
   * @memberof CategoryService
   */
  async findListWithQuery(query: QueryCategory) {
    const qb = this.categoryRepository.createQueryBuilder('category');

    // 名称模糊查询
    if (query.name) {
      qb.andWhere('category.name like :name', { name: `%${query.name}%` });
    }

    // 时间查询
    if (query.start && query.end) {
      qb.andWhere('category.created_at BETWEEN :start AND :end', {
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
    return this.categoryRepository.findOneBy({ id });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const result = await this.findOne(id);

    if (!result) {
      this.error('分类不存在');
    }
    return this.categoryRepository.update(id, updateCategoryDto);
  }

  async remove(id: number) {
    const result = await this.categoryRepository.findOne({
      where: { id },
      relations: ['share'],
    });

    if (!result) {
      this.error('分类不存在');
    }

    return this.categoryRepository.softRemove(result);
  }
}
