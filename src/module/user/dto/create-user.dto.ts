import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  IsEnum,
} from 'class-validator';
import { RoleTypeEnum, StatusEnum } from '@/enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  readonly username: string;

  @IsString()
  @IsOptional()
  readonly nickname?: string;

  @IsString()
  @MinLength(11)
  // @IsNotEmpty({ message: '手机号不能为空' })
  @IsOptional()
  readonly mobile?: string;

  @IsString()
  @MinLength(4)
  // @IsNotEmpty({ message: '密码不能为空' })
  @IsOptional()
  readonly password?: string;

  @IsEnum(RoleTypeEnum)
  @IsOptional()
  readonly role?: RoleTypeEnum;

  @IsEnum(StatusEnum)
  @IsOptional()
  readonly status?: StatusEnum;
}
