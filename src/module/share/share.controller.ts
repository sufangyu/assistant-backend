import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ShareService } from './share.service';
import { CreateShareDto } from './dto/create-share.dto';
import { QueryGroupShareDto, QueryShareDto } from './dto/query-share.dto';
import { UpdateShareDto } from './dto/update-share.dto';

@Controller('share')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Post()
  create(@Body() createShareDto: CreateShareDto) {
    return this.shareService.create(createShareDto);
  }

  @Get()
  findAll(@Query() query: QueryShareDto) {
    return this.shareService.findListWithQuery(query);
  }

  @Get('query')
  findWithQuery(@Query() query: QueryShareDto) {
    return this.shareService.findByQuery(query);
  }

  /**
   * 按条件查询分组
   *
   * - 按年份查询时, 不能传当前年份(year)
   * - 按季度/月份查询时，可不传今年, 查询今年的数据
   *
   * @param {({ type: 'year' | 'quarter' | 'month' })} query
   * @return {*}
   * @memberof ShareController
   */
  @Get('group')
  async findGroup(@Query() query: QueryGroupShareDto) {
    const { type, year } = query;
    const curYear = new Date().getFullYear().toString();
    const qYear = ['quarter', 'month'].includes(type) ? year || curYear : null;
    const rawRes = await this.shareService.findAllGroup(qYear);

    // 处理数据
    const resGroup = {};
    rawRes.forEach((it) => {
      const key = it[type];
      if (!resGroup[key]) {
        resGroup[key] = {
          [type]: it[type],
          list: [],
        };
      }

      resGroup[key].list.push({
        id: it.id,
        title: it.title,
        createdAt: it.createdAt,
      });
    });

    return Object.values(resGroup);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShareDto: UpdateShareDto) {
    return this.shareService.update(+id, updateShareDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shareService.remove(+id);
  }

  @Get('website')
  websiteInfo(@Query('url') url: string) {
    return this.shareService.getWebsiteInfo(url);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.shareService.findOne(+id);
  }
}
