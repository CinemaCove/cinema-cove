import { AddonConfigEntity } from '../../domain/entities';

export class AddonConfigResponseDto {
  public readonly id: string;
  public readonly owner: string;
  public readonly name: string;
  public readonly type: 'movie' | 'tv';
  public readonly source: 'discover' | 'tmdb-list' | 'trakt-list' | 'curated-list' | 'franchise-group';
  public readonly curatedGroupId: string | null;
  public readonly tmdbListId: string | null;
  public readonly tmdbListType: 'watchlist' | 'favorites' | 'rated' | null;
  public readonly traktListId: string | null;
  public readonly traktListType: 'watchlist' | 'favorites' | 'rated' | null;
  public readonly imagePath: string | null;
  public readonly languages: readonly string[];
  public readonly sort: string;
  public readonly includeAdult: boolean;
  public readonly minVoteAverage: number | null;
  public readonly minVoteCount: number | null;
  public readonly releaseDateFrom: number | null;
  public readonly releaseDateTo: number | null;

  constructor(entity: AddonConfigEntity) {
    this.id = entity.id!;
    this.owner = entity.owner;
    this.name = entity.name;
    this.type = entity.type;
    this.source = entity.source;
    this.curatedGroupId = entity.curatedGroupId;
    this.tmdbListId = entity.tmdbListId;
    this.tmdbListType = entity.tmdbListType;
    this.traktListId = entity.traktListId;
    this.traktListType = entity.traktListType;
    this.imagePath = entity.imagePath;
    this.languages = entity.languages;
    this.sort = entity.sort;
    this.includeAdult = entity.includeAdult;
    this.minVoteAverage = entity.minVoteAverage;
    this.minVoteCount = entity.minVoteCount;
    this.releaseDateFrom = entity.releaseDateFrom;
    this.releaseDateTo = entity.releaseDateTo;
  }
}
