import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { GetTmdbListsQuery } from './get-tmdb-lists.query';
import { TmdbBuiltinListItemDto, TmdbListsResponseDto } from '../dtos';
import { TmdbService } from '../../../shared/infrastructure/tmdb/tmdb.service';
import { GetUserByIdQuery } from '../../../users/application/queries/get-user-by-id.query';
import type { UserResponseDto } from '../../../users/application/dtos/user-response.dto';
import { TMDB_BUILTIN_LISTS } from '../../integrations.constants';

@QueryHandler(GetTmdbListsQuery)
export class GetTmdbListsQueryHandler
  implements IQueryHandler<GetTmdbListsQuery, TmdbListsResponseDto>
{
  constructor(
    private readonly tmdbService: TmdbService,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(query: GetTmdbListsQuery): Promise<TmdbListsResponseDto> {
    const user = await this.queryBus.execute<GetUserByIdQuery, UserResponseDto | null>(
      new GetUserByIdQuery(query.userId),
    );
    if (!user?.tmdbSessionId || !user?.tmdbAccountId) {
      return new TmdbListsResponseDto([], [], 0, 1);
    }

    const [builtinLists, customData] = await Promise.all([
      Promise.all(
        TMDB_BUILTIN_LISTS.map(async (def): Promise<TmdbBuiltinListItemDto> => {
          const data = await this.tmdbService.getTmdbUserList(
            def.listType,
            def.type,
            user.tmdbAccountId!,
            user.tmdbSessionId!,
            1,
          );
          return {
            listType: def.listType,
            type: def.type,
            label: def.label,
            icon: def.icon,
            itemCount: data.totalResults ?? 0,
          };
        }),
      ),
      this.tmdbService.getUserCustomLists(user.tmdbAccountId, user.tmdbSessionId, query.page),
    ]);

    return new TmdbListsResponseDto(
      builtinLists,
      customData.results.map((l) => ({
        id: String(l.id),
        name: l.name,
        description: l.description,
        itemCount: l.itemCount,
      })),
      customData.totalPages,
      query.page,
    );
  }
}
