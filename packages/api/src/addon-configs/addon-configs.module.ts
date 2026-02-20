import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AddonConfig, AddonConfigSchema } from './schemas/addon-config.schema';
import { AddonConfigsService } from './addon-configs.service';
import { AddonConfigsController } from './addon-configs.controller';

@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: AddonConfig.name, schema: AddonConfigSchema }])],
  controllers: [AddonConfigsController],
  providers: [AddonConfigsService],
  exports: [AddonConfigsService],
})
export class AddonConfigsModule {}
