import { Module } from '@nestjs/common';
import { ReferenceController } from './reference.controller';
import { TmdbModule } from '../shared';
import {
  GetSortOptionsQueryHandler,
  GetLanguagesQueryHandler,
} from './application';
import { ConfigService } from '@nestjs/config';
import { REFERENCE_CACHE_CONFIG } from './reference.constants';
import { CqrsModule } from '@nestjs/cqrs';
import { CacheModule } from '../shared/infrastructure/cache/cache.module';

@Module({
  controllers: [ReferenceController],
  imports: [CqrsModule, TmdbModule, CacheModule],
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
