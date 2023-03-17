import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { PushResultModuleEnum } from '@/enum';

export class CreatePushRecordDto {
  @IsEnum(PushResultModuleEnum)
  @IsString()
  @IsNotEmpty({ message: '功能模块不能为空' })
  module: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  variable: string;
}
