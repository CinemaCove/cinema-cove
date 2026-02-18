import { SortBy } from '../../tmdb/tmdb.service';

export interface AddonConfig {
  name: string;
  type: 'movie' | 'tv';
  languages: string[];
  sort: SortBy;
}
