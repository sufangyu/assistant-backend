import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  IsEnum,
  MaxLength,
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
  @MaxLength(11, { message: '手机号只能是11位数字' })
  @MinLength(11, { message: '手机号只能是11位数字' })
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
