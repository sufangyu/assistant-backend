import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@/common/service/base';
import { CreateRobotDto } from './dto/create-robot.dto';
import { UpdateRobotDto } from './dto/update-robot.dto';
import { Robot } from './entities/robot.entity';

@Injectable()
export class RobotService extends BaseService {
  constructor(
    @InjectRepository(Robot)
    private readonly robotRepository: Repository<Robot>,
  ) {
    super();
  }

  create(createRobotDto: CreateRobotDto) {
    return this.robotRepository.save(createRobotDto);
  }

  findAll() {
    return this.robotRepository.find();
  }

  findOne(id: number) {
    return this.robotRepository.findOneBy({ id });
  }

  async update(id: number, updateRobotDto: UpdateRobotDto) {
    const result = await this.findOne(id);

    if (!result) {
      this.error('机器人不存在');
    }

    return this.robotRepository.update(+id, updateRobotDto);
  }

  async remove(id: number) {
    const result = await this.findOne(id);

    if (!result) {
      this.error('机器人不存在');
    }

    return this.robotRepository.softRemove(result);
  }
}
