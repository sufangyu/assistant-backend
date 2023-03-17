import { PartialType } from '@nestjs/mapped-types';
import { PushRecordResult } from '../entities/push-record.entity';
import { CreatePushRecordDto } from './create-push-record.dto';

export class UpdatePushRecordDto extends PartialType(CreatePushRecordDto) {
  id?: number;
  results?: PushRecordResult[];
}
