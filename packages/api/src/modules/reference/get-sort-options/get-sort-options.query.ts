import { Query } from '@nestjs/cqrs';
import { SortOptionDto } from './sort-option.dto';

export class GetSortOptionsQuery extends Query<SortOptionDto[]> {}
