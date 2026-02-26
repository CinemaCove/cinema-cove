export class UpdateAddonConfigDto {
  public readonly name?: string;
  public readonly type?: 'movie' | 'tv';
  public readonly languages?: string[];
  public readonly sort?: string;
  public readonly includeAdult?: boolean;
  public readonly minVoteAverage?: number | null;
  public readonly minVoteCount?: number | null;
  public readonly releaseDateFrom?: number | null;
  public readonly releaseDateTo?: number | null;
  public readonly installedVersion?: number | null;
}
