import { Module } from '@nestjs/common';
import { StremioController } from './stremio.controller';
import { StremioService } from './stremio.service';
import { TmdbModule } from '../tmdb/tmdb.module';
import { TraktModule } from '../trakt/trakt.module';

@Module({
  imports: [TmdbModule, TraktModule],
  controllers: [StremioController],
  providers: [StremioService],
})
export class StremioModule {}
