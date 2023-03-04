import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { RobotTypeEnum } from '@/enum';

export class CreateRobotDto {
  @IsString()
  @IsNotEmpty({ message: '机器人名称不能为空' })
  name: string;

  /** 机器人类型（1: 飞书; 2: 钉钉; 3: 企微） */
  // @IsEnum([1, 2, 3])
  @IsEnum(RobotTypeEnum)
  @IsNotEmpty({ message: '机器人类型不能为空' })
  type: number;

  @IsString()
  @IsNotEmpty({ message: 'Webhook不能为空' })
  webhook: string;
}
