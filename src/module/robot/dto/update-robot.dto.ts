import { PartialType } from '@nestjs/mapped-types';
import { StatusType } from '@/enum';
import { CreateRobotDto } from './create-robot.dto';

export class UpdateRobotDto extends PartialType(CreateRobotDto) {}

export class UpdateRobotStatusDto {
  status: StatusType;
}
