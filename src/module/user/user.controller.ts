import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { NoAuth, Roles } from '@/decorator';
import { RoleTypeEnum } from '@/enum';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUser } from './dto/query-user.dto';

@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(RoleTypeEnum.ROOT, RoleTypeEnum.AUTHOR)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('list')
  findWithQuery(@Query() query: QueryUser) {
    return this.userService.findListWithQuery(query);
  }

  // @NoAuth()
  @Get('detail')
  findDetail(@Req() req: Request) {
    const accessToken = req.get('Authorization');
    return this.userService.findDetail(accessToken);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Patch('/status/:id')
  updateStatus(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateStatus(+id, updateUserDto);
  }

  @Patch('/reset/:id')
  resetPassword(@Param('id') id: string) {
    return this.userService.resetPassword(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
