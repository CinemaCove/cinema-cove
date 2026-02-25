export interface TraktBuiltinListItemDto {
  listType: 'watchlist' | 'favorites' | 'rated';
  type: 'movie' | 'tv';
  label: string;
  icon: string;
  itemCount: number;
}

export interface TraktCustomListItemDto {
  id: string;
  slug: string;
  name: string;
  description: string;
  itemCount: number;
}

export class TraktListsResponseDto {
  constructor(
    public readonly builtinLists: TraktBuiltinListItemDto[],
    public readonly customLists: TraktCustomListItemDto[],
  ) {}
}
