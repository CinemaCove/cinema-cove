export class AddonConfigEntity {
  constructor(
    public readonly id: string | null,
    public readonly owner: string,
    public readonly name: string,
    public readonly type: 'movie' | 'tv',
    public readonly languages: readonly string[],
    public readonly sort: string,
    public readonly source: 'discover' | 'tmdb-list' | 'trakt-list' | 'curated-list',
    public readonly tmdbListId: string | null,
    public readonly tmdbListType: 'watchlist' | 'favorites' | 'rated' | null,
    public readonly traktListId: string | null,
    public readonly traktListType: 'watchlist' | 'favorites' | 'rated' | null,
    public readonly imagePath: string | null,
    public readonly includeAdult: boolean,
    public readonly minVoteAverage: number | null,
    public readonly minVoteCount: number | null,
    public readonly releaseDateFrom: number | null,
    public readonly releaseDateTo: number | null,
  ) {}
}
