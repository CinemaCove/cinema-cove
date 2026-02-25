import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LanguageDto } from '../dtos';
import { TmdbClient } from '@cinemacove/tmdb-client/v3';
import { Inject } from '@nestjs/common';
import { REFERENCE_CACHE_CONFIG } from '../../reference.constants';
import { GetLanguagesQuery } from './get-languages.query';
import { CacheService } from '../../../shared/domain/services/cache.service';
import { ConfigService } from '@nestjs/config';

@QueryHandler(GetLanguagesQuery)
export class GetLanguagesQueryHandler implements IQueryHandler<
  GetLanguagesQuery,
  LanguageDto[]
> {
  private readonly tmdbClient: TmdbClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    @Inject(REFERENCE_CACHE_CONFIG)
    private readonly cacheConfig: {
      languagesTtl: number;
    },
  ) {
    this.tmdbClient = new TmdbClient(
      this.configService.get<string>('TMDB_API_KEY', ''),
    );
  }

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
