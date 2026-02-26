import { Query } from '@nestjs/cqrs';
import { CuratedGroupDto } from '../dtos/curated-group.dto';

export class GetCuratedGroupByIdQuery extends Query<CuratedGroupDto | null> {
  constructor(public readonly id: string) {
    super();
  }
}
