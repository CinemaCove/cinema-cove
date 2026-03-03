import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';
import { AddonConfigsModule } from './modules/addon-configs/addon-configs.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { ReferenceModule } from './modules/reference';
import { StremioModule } from './modules/stremio/stremio.module';
import { CuratedListsModule } from './modules/curated-lists/curated-lists.module';
import { CuratedGroupsModule } from './modules/curated-groups/curated-groups.module';
import { CacheModule } from './modules/shared/infrastructure/cache/cache.module';
import {
  ApiThrottlerGuard,
  AuthThrottlerGuard,
  StremioThrottlerGuard,
} from './common/guards/throttler.guards';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const ttl = config.get<number>('THROTTLE_TTL', 60_000);
        return {
          throttlers: [
            {
              name: 'stremio',
              ttl,
              limit: config.get<number>('THROTTLE_STREMIO_LIMIT', 120),
            },
            {
              name: 'auth',
              ttl,
              limit: config.get<number>('THROTTLE_AUTH_LIMIT', 10),
            },
            {
              name: 'api',
              ttl,
              limit: config.get<number>('THROTTLE_API_LIMIT', 60),
            },
          ],
        };
      },
    }),

    CacheModule,
    AuthModule,
    UsersModule,
    AddonConfigsModule,
    IntegrationsModule,
    ReferenceModule,
    StremioModule,
    CuratedListsModule,
    CuratedGroupsModule,
  ],
  controllers: [AppController],
  providers: [StremioThrottlerGuard, AuthThrottlerGuard, ApiThrottlerGuard],
})
export class AppModule {}
