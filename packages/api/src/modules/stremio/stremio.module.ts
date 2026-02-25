import { Module } from '@nestjs/common';
import { StremioController } from './stremio.controller';
import { StremioService } from './stremio.service';
import { TmdbModule } from '../shared/infrastructure/tmdb/tmdb.module';
import { TraktModule } from '../shared/infrastructure/trakt/trakt.module';

@Module({
  imports: [TmdbModule, TraktModule],
  controllers: [StremioController],
  providers: [StremioService],
})
export class StremioModule {}
