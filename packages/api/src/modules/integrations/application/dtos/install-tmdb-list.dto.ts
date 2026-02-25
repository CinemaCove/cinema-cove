export type InstallTmdbListBodyDto =
  | { kind: 'builtin'; listType: 'watchlist' | 'favorites' | 'rated'; type: 'movie' | 'tv'; label: string }
  | { kind: 'custom'; listId: string; name: string };
