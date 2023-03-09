import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { PushResultEnum, PushResultModuleEnum } from '@/enum';

export class CreatePushRecordDto {
  @IsEnum(PushResultModuleEnum)
  @IsString()
  @IsNotEmpty({ message: '功能模块不能为空' })
  module: string;

  @IsString()
  variable: string;

  @IsEnum(PushResultEnum)
  @IsNotEmpty({ message: '推送结果不能为空' })
  result: number;
}
