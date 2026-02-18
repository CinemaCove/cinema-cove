import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { TmdbModule } from './tmdb/tmdb.module';
import { LanguagesModule } from './languages/languages.module';
import { StremioModule } from './stremio/stremio.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TmdbModule,
    LanguagesModule,
    StremioModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
