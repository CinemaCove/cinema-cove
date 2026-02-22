import { Module } from '@nestjs/common';
import { ReferenceController } from './reference.controller';
import { CacheModule, TmdbModule } from '../shared';
import { GetLanguagesQueryHandler } from './get-languages';
import { ConfigService } from '@nestjs/config';
import { REFERENCE_CACHE_CONFIG } from './reference.constants';
import { CqrsModule } from '@nestjs/cqrs';
import { GetSortOptionsQueryHandler } from './get-sort-options';

@Module({
  controllers: [ReferenceController],
  imports: [CqrsModule, CacheModule, TmdbModule],
  providers: [
    GetLanguagesQueryHandler,
    GetSortOptionsQueryHandler,
    {
      provide: REFERENCE_CACHE_CONFIG,
      useFactory: (configService: ConfigService) => ({
        languagesTtl: parseInt(
          configService.get(
            'TMDB_SHORT_CACHE_TTL',
            String(30 * 24 * 60 * 60 * 1000),
          ),
          10,
        ),
      }),
      inject: [ConfigService],
    },
  ],
})
export class ReferenceModule {}
