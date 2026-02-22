import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TmdbClient } from '@cinemacove/tmdb-client/v3';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: TmdbClient,
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('TMDB_API_KEY', '');
        return new TmdbClient(apiKey);
      },
      inject: [ConfigService],
    },
  ],
  exports: [TmdbClient],
})
export class TmdbModule {}
