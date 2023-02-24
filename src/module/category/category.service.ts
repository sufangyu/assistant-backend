import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@/common/service/base';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

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
