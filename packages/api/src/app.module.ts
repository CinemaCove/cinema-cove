import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { CacheModule } from './cache/cache.module';
import { TmdbModule } from './tmdb/tmdb.module';
import { ReferenceModule } from './reference/reference.module';
import { StremioModule } from './stremio/stremio.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AddonConfigsModule } from './addon-configs/addon-configs.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { CuratedListsModule } from './curated-lists/curated-lists.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule,
    TmdbModule,
    ReferenceModule,
    StremioModule,
    AuthModule,
    UsersModule,
    AddonConfigsModule,
    IntegrationsModule,
    CuratedListsModule,
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
