import { Query } from '@nestjs/cqrs';
import { CuratedListDto } from '../dtos/curated-list.dto';

export class GetAllCuratedListsQuery extends Query<CuratedListDto[]> {}
