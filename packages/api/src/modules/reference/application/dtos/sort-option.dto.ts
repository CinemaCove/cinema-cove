import { SortBy } from '../../../shared/infrastructure/tmdb/tmdb.service';

export interface SortOptionDto {
  value: SortBy;
  label: string;
}
