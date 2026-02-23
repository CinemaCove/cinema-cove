import { Query } from '@nestjs/cqrs';
import { SortOptionDto } from '../dtos';

export class GetSortOptionsQuery extends Query<SortOptionDto[]> {}
