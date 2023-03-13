import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  readonly username: string;

  @IsString()
  @IsOptional()
  readonly nickname?: string;

  @IsString()
  @MinLength(11)
  @IsNotEmpty({ message: '手机号不能为空' })
  readonly mobile: string;

  @IsString()
  @MinLength(4)
  @IsNotEmpty({ message: '密码不能为空' })
  readonly password: string;

  @IsString()
  @MinLength(4)
  @IsNotEmpty({ message: '确认密码不能为空' })
  readonly passwordRepeat: string;
}
