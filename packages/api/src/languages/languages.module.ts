import { Module } from '@nestjs/common';
import { LanguagesController } from './languages.controller';
import { TmdbModule } from '../tmdb/tmdb.module';

@Module({
  imports: [TmdbModule],
  controllers: [LanguagesController],
})
export class LanguagesModule {}
