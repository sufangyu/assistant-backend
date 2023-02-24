import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BaseService } from '@/common/service/base';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

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
