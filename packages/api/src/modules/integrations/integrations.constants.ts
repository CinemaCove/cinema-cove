export interface BuiltinListDef {
  listType: 'watchlist' | 'favorites' | 'rated';
  type: 'movie' | 'tv';
  label: string;
  icon: string;
}

export const TMDB_BUILTIN_LISTS: readonly BuiltinListDef[] = [
  { listType: 'watchlist', type: 'movie', label: 'Movie Watchlist', icon: 'bookmark' },
  { listType: 'watchlist', type: 'tv',    label: 'TV Watchlist',    icon: 'bookmark' },
  { listType: 'favorites', type: 'movie', label: 'Favorite Movies', icon: 'favorite' },
  { listType: 'favorites', type: 'tv',    label: 'Favorite Shows',  icon: 'favorite' },
  { listType: 'rated',     type: 'movie', label: 'Rated Movies',    icon: 'star' },
  { listType: 'rated',     type: 'tv',    label: 'Rated Shows',     icon: 'star' },
];

export const TRAKT_BUILTIN_LISTS: readonly BuiltinListDef[] = [
  { listType: 'watchlist', type: 'movie', label: 'Movie Watchlist', icon: 'bookmark' },
  { listType: 'watchlist', type: 'tv',    label: 'TV Watchlist',    icon: 'bookmark' },
  { listType: 'favorites', type: 'movie', label: 'Favorite Movies', icon: 'favorite' },
  { listType: 'favorites', type: 'tv',    label: 'Favorite Shows',  icon: 'favorite' },
  { listType: 'rated',     type: 'movie', label: 'Rated Movies',    icon: 'star' },
  { listType: 'rated',     type: 'tv',    label: 'Rated Shows',     icon: 'star' },
];
