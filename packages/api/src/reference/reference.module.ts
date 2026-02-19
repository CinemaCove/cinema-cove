import { Module } from '@nestjs/common';
import { TmdbModule } from '../tmdb/tmdb.module';
import { ReferenceController } from './reference.controller';

@Module({
  imports: [TmdbModule],
  controllers: [ReferenceController],
})
export class ReferenceModule {}
