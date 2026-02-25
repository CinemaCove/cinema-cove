import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheService } from '../../domain/services/cache.service';
import { MongoCacheService } from './mongo-cache.service';
import { Cache, CacheSchema } from './cache.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cache.name, schema: CacheSchema }]),
  ],
  providers: [{ provide: CacheService, useClass: MongoCacheService }],
  exports: [CacheService],
})
export class CacheModule {}
