import { SortBy } from '../../tmdb/tmdb.service';

export interface AddonConfig {
  owner: string;
  name: string;
  type: 'movie' | 'tv';
  languages: string[];
  sort: SortBy;
  source: 'discover' | 'tmdb-list';
  tmdbListId?: string;
  tmdbListType?: 'watchlist' | 'favorites' | 'rated';
}
