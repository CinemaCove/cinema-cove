import { SortBy } from '../../tmdb/tmdb.service';

export interface AddonConfig {
  owner: string;
  name: string;
  type: 'movie' | 'tv';
  languages: string[];
  sort: SortBy;
  source: 'discover' | 'tmdb-list' | 'trakt-list';
  tmdbListId?: string;
  tmdbListType?: 'watchlist' | 'favorites' | 'rated';
  traktListId?: string;
  traktListType?: 'watchlist' | 'favorites' | 'rated';
  // Discover filters
  includeAdult?: boolean;
  minVoteAverage?: number;
  minVoteCount?: number;
  releaseDateFrom?: number;
  releaseDateTo?: number;
}
