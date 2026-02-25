import { Query } from '@nestjs/cqrs';
import { CuratedListDto } from '../dtos/curated-list.dto';

export class GetCuratedListByIdQuery extends Query<CuratedListDto | null> {
  constructor(public readonly id: string) {
    super();
  }
}
