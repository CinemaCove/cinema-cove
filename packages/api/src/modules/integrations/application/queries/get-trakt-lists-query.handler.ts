import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import type { FavoriteItem, RatingItem, UserList, WatchlistItem } from '@cinemacove/trakt-client';
import { GetTraktListsQuery } from './get-trakt-lists.query';
import { TraktBuiltinListItemDto, TraktListsResponseDto } from '../dtos';
import { TraktService } from '../../../shared/infrastructure/trakt/trakt.service';
import { GetUserByIdQuery } from '../../../users/application/queries/get-user-by-id.query';
import type { UserResponseDto } from '../../../users/application/dtos/user-response.dto';
import { TRAKT_BUILTIN_LISTS } from '../../integrations.constants';

@QueryHandler(GetTraktListsQuery)
export class GetTraktListsQueryHandler
  implements IQueryHandler<GetTraktListsQuery, TraktListsResponseDto>
{
  constructor(
    private readonly traktService: TraktService,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(query: GetTraktListsQuery): Promise<TraktListsResponseDto> {
    const user = await this.queryBus.execute<GetUserByIdQuery, UserResponseDto | null>(
      new GetUserByIdQuery(query.userId),
    );
    if (!user?.traktAccessToken) {
      return new TraktListsResponseDto([], []);
    }

    const token = user.traktAccessToken;

    const [builtinLists, customLists] = await Promise.all([
      Promise.all(
        TRAKT_BUILTIN_LISTS.map(async (def): Promise<TraktBuiltinListItemDto> => {
          const traktType = def.type === 'movie' ? 'movies' : 'shows';
          let itemCount = 0;
          try {
            const items: Array<WatchlistItem | FavoriteItem | RatingItem> =
              def.listType === 'watchlist'
                ? await this.traktService.getWatchlist(token, traktType, 1, 1)
                : def.listType === 'favorites'
                  ? await this.traktService.getFavorites(token, traktType, 1, 1)
                  : await this.traktService.getRatings(token, traktType, 1, 1);
            itemCount = items.length;
          } catch {
            itemCount = 0;
          }
          return { listType: def.listType, type: def.type, label: def.label, icon: def.icon, itemCount };
        }),
      ),
      this.traktService.getUserLists(token).then((lists: UserList[]) =>
        lists.map((l) => ({
          id: String(l.ids.trakt),
          slug: l.ids.slug,
          name: l.name,
          description: l.description ?? '',
          itemCount: l.itemCount,
        })),
      ),
    ]);

    return new TraktListsResponseDto(builtinLists, customLists);
  }
}
