import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';
import { AddonConfigsModule } from './modules/addon-configs/addon-configs.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { ReferenceModule } from './modules/reference';
import { StremioModule } from './modules/stremio/stremio.module';
import { CuratedListsModule } from './modules/curated-lists/curated-lists.module';
import { CacheModule } from './modules/shared/infrastructure/cache/cache.module';

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

    CacheModule,
    AuthModule,
    UsersModule,
    AddonConfigsModule,
    IntegrationsModule,
    ReferenceModule,
    StremioModule,
    CuratedListsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
