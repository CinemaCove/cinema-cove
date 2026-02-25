import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { GetTraktStatusQuery } from './get-trakt-status.query';
import { TraktStatusDto } from '../dtos';
import { GetUserByIdQuery } from '../../../users/application/queries/get-user-by-id.query';
import type { UserResponseDto } from '../../../users/application/dtos/user-response.dto';

@QueryHandler(GetTraktStatusQuery)
export class GetTraktStatusQueryHandler
  implements IQueryHandler<GetTraktStatusQuery, TraktStatusDto>
{
  constructor(private readonly queryBus: QueryBus) {}

  async execute(query: GetTraktStatusQuery): Promise<TraktStatusDto> {
    const user = await this.queryBus.execute<GetUserByIdQuery, UserResponseDto | null>(
      new GetUserByIdQuery(query.userId),
    );
    return new TraktStatusDto(!!user?.traktAccessToken, user?.traktUsername ?? null);
  }
}
