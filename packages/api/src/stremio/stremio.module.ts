import { Module } from '@nestjs/common';
import { StremioController } from './stremio.controller';
import { StremioService } from './stremio.service';
import { TmdbModule } from '../tmdb/tmdb.module';

@Module({
  imports: [TmdbModule],
  controllers: [StremioController],
  providers: [StremioService],
})
export class StremioModule {}
