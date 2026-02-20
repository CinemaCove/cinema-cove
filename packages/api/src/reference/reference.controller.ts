import { Controller, Get } from '@nestjs/common';
import { SortBy, TmdbService } from '../tmdb/tmdb.service';

export interface SortOption {
  value: SortBy;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'popularity.desc', label: 'Popularity' },
  { value: 'release_date.desc', label: 'Release Date' },
  { value: 'vote_average.desc', label: 'Vote Average' },
];

@Controller('reference')
export class ReferenceController {
  constructor(private readonly tmdbService: TmdbService) {}

  @Get('languages')
  getLanguages() {
    return this.tmdbService.getLanguages();
  }

  @Get('sort-options')
  getSortOptions(): SortOption[] {
    return SORT_OPTIONS;
  }
}
