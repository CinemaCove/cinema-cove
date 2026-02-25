export interface TmdbBuiltinListItemDto {
  listType: 'watchlist' | 'favorites' | 'rated';
  type: 'movie' | 'tv';
  label: string;
  icon: string;
  itemCount: number;
}

export interface TmdbCustomListItemDto {
  id: string;
  name: string;
  description: string;
  itemCount: number;
}

export class TmdbListsResponseDto {
  constructor(
    public readonly builtinLists: TmdbBuiltinListItemDto[],
    public readonly customLists: TmdbCustomListItemDto[],
    public readonly totalPages: number,
    public readonly page: number,
  ) {}
}
