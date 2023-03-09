import { PartialType } from '@nestjs/mapped-types';
import { CreatePushRecordDto } from './create-push-record.dto';

export class UpdatePushRecordDto extends PartialType(CreatePushRecordDto) {
  id?: number;
}
