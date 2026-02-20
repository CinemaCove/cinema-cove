import { Module } from '@nestjs/common';
import { TmdbModule } from '../tmdb/tmdb.module';
import { TraktModule } from '../trakt/trakt.module';
import { IntegrationsController } from './integrations.controller';

@Module({
  imports: [TmdbModule, TraktModule],
  controllers: [IntegrationsController],
})
export class IntegrationsModule {}
