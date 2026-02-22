import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LanguageDto } from './language.dto';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../../shared';
import { TmdbClient } from '@cinemacove/tmdb-client/v3';
import { Inject } from '@nestjs/common';
import { REFERENCE_CACHE_CONFIG } from '../reference.constants';
import { GetLanguagesQuery } from './get-languages.query';

@QueryHandler(GetLanguagesQuery)
export class GetLanguagesQueryHandler implements IQueryHandler<
  GetLanguagesQuery,
  LanguageDto[]
> {
  constructor(
    private readonly cacheService: CacheService,
    private readonly tmdbClient: TmdbClient,
    @Inject(REFERENCE_CACHE_CONFIG)
    private readonly cacheConfig: {
      languagesTtl: number;
    },
  ) {}

  public async execute(_: GetLanguagesQuery): Promise<LanguageDto[]> {
    return await this.cacheService.getOrSet(
      'languages',
      async () =>
        (await this.tmdbClient.configuration.getLanguages()).sort((a, b) =>
          a.englishName.localeCompare(b.englishName),
        ),
      this.cacheConfig.languagesTtl,
    );
  }
}
