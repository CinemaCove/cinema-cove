import { Controller, Get } from '@nestjs/common';
import { TmdbService } from '../tmdb/tmdb.service';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly tmdbService: TmdbService) {}

  @Get()
  getLanguages() {
    return this.tmdbService.getLanguages();
  }
}
