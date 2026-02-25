import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { GetTmdbStatusQuery } from './get-tmdb-status.query';
import { TmdbStatusDto } from '../dtos';
import { GetUserByIdQuery } from '../../../users/application/queries/get-user-by-id.query';
import type { UserResponseDto } from '../../../users/application/dtos/user-response.dto';

@QueryHandler(GetTmdbStatusQuery)
export class GetTmdbStatusQueryHandler
  implements IQueryHandler<GetTmdbStatusQuery, TmdbStatusDto>
{
  constructor(private readonly queryBus: QueryBus) {}

  async execute(query: GetTmdbStatusQuery): Promise<TmdbStatusDto> {
    const user = await this.queryBus.execute<GetUserByIdQuery, UserResponseDto | null>(
      new GetUserByIdQuery(query.userId),
    );
    return new TmdbStatusDto(
      !!user?.tmdbSessionId,
      user?.tmdbAccountId ?? null,
      user?.tmdbUsername ?? null,
    );
  }
}
