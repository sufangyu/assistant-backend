import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTagDto {
  @IsString({ message: '标签名称为字符串格式' })
  @IsNotEmpty({ message: '标签名称不能为空' })
  name: string;
}
