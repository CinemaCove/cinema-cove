import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { CacheModule } from './cache/cache.module';
import { TmdbModule } from './tmdb/tmdb.module';
import { LanguagesModule } from './languages/languages.module';
import { StremioModule } from './stremio/stremio.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AddonConfigsModule } from './addon-configs/addon-configs.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule,
    TmdbModule,
    LanguagesModule,
    StremioModule,
    AuthModule,
    UsersModule,
    AddonConfigsModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL')
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
