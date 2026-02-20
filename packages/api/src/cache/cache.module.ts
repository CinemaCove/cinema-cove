import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Cache, CacheSchema } from './schemas/cache.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cache.name, schema: CacheSchema }]),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
