import { Query } from '@nestjs/cqrs';
import { CuratedGroupDto } from '../dtos/curated-group.dto';

export class GetAllCuratedGroupsQuery extends Query<CuratedGroupDto[]> {}
