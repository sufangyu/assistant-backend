import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ShareService } from './share.service';
import { CreateShareDto } from './dto/create-share.dto';
import {
  QueryShareDto,
  QueryShareFiledDto,
  QueryShareTrendDto,
  TrendQueryDto,
} from './dto/query-share.dto';
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
   * 按条件归档查询
   *
   * @param {QueryShareFiledDto} query
   * @return {*}
   * @memberof ShareController
   */
  @Get('filed')
  async findAllFiled(@Query() query: QueryShareFiledDto) {
    return this.shareService.findAllFiled(query);
  }

  /**
   * 趋势同比（季度/月度）
   *
   * @memberof ShareController
   */
  @Get('year-over-year')
  async findTrendYearOverYear(@Query() query: QueryShareTrendDto) {
    const current = await this.shareService.trendYearOverYear(query, '2023');
    const prev = await this.shareService.trendYearOverYear(query, '2022');

    return {
      current,
      prev,
    };
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

  @Get('trend')
  trend(@Query() query: TrendQueryDto) {
    return this.shareService.trend(query);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.shareService.findOne(+id);
  }

  @Get('total/:type')
  totalRecent(@Param('type') type: 'year' | 'month') {
    const params = ['year', 'month'];
    if (!params.includes(type)) {
      throw new HttpException(
        { message: `type只支持year、month` },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.shareService.totalRecent(type);
  }

  @Get('pip/:type')
  pip(@Param('type') type: 'category' | 'tag' | 'robot') {
    switch (type) {
      case 'category':
        return this.shareService.pipCategory();
      case 'robot':
        return this.shareService.pipRobot();
      case 'tag':
        return this.shareService.pipTag();
      default:
        throw new HttpException(
          { message: `type只支持category、tag、robot` },
          HttpStatus.BAD_REQUEST,
        );
    }
  }
}
