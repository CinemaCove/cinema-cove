import { Module } from '@nestjs/common';
import { TmdbModule } from '../tmdb/tmdb.module';
import { IntegrationsController } from './integrations.controller';

@Module({
  imports: [TmdbModule],
  controllers: [IntegrationsController],
})
export class IntegrationsModule {}
