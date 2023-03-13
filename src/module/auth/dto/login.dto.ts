import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  readonly username: string;

  @IsString()
  @MinLength(4)
  @IsNotEmpty({ message: '密码不能为空' })
  readonly password: string;
}
