export class CreateAddonConfigDto {
  public readonly name!: string;
  public readonly type!: 'movie' | 'tv';
  public readonly languages!: string[];
  public readonly sort!: string;
  public readonly source?: 'discover' | 'tmdb-list' | 'trakt-list' | 'curated-list' | 'franchise-group';
  public readonly curatedGroupId?: string;
  public readonly tmdbListId?: string;
  public readonly tmdbListType?: 'watchlist' | 'favorites' | 'rated';
  public readonly traktListId?: string;
  public readonly traktListType?: 'watchlist' | 'favorites' | 'rated';
  public readonly imagePath?: string;
  public readonly includeAdult?: boolean;
  public readonly minVoteAverage?: number | null;
  public readonly minVoteCount?: number | null;
  public readonly releaseDateFrom?: number | null;
  public readonly releaseDateTo?: number | null;
  public readonly installedVersion?: number;
}
