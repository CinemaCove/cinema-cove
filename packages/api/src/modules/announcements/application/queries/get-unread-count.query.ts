import { Query } from '@nestjs/cqrs';

export class GetUnreadCountQuery extends Query<{ count: number }> {
  constructor(public readonly userId: string) {
    super();
  }
}
