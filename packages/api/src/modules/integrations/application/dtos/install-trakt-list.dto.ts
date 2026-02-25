export type InstallTraktListBodyDto =
  | { kind: 'builtin'; listType: 'watchlist' | 'favorites' | 'rated'; type: 'movie' | 'tv'; label: string }
  | { kind: 'custom'; listId: string; slug: string; name: string };
