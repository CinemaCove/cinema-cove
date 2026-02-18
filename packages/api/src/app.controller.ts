import { Controller, Get, Redirect } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SortBy } from './tmdb/tmdb.service';

export interface SortOption {
  value: SortBy;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'popularity.desc', label: 'Popularity' },
  { value: 'release_date.desc', label: 'Release Date' },
  { value: 'vote_average.desc', label: 'Vote Average' },
];

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @Redirect()
  configure() {
    const url = this.configService.get<string>(
      'CONFIGURE_URL',
      'http://localhost:4200',
    );
    return { url, statusCode: 302 };
  }

  @Get('sort-options')
  getSortOptions(): SortOption[] {
    return SORT_OPTIONS;
  }
}
