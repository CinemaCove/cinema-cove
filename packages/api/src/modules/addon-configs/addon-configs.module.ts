import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AddonConfigsController } from './addon-configs.controller';
import { AddonConfigsRepository } from './domain/repositories';
import { MongoAddonConfigsRepository, AddonConfig, AddonConfigSchema } from './infrastructure';
import {
  CreateAddonConfigCommandHandler,
  UpdateAddonConfigCommandHandler,
  DeleteAddonConfigCommandHandler,
  GetAddonConfigsByOwnerQueryHandler,
  GetAddonConfigByIdQueryHandler,
  FindExistingTmdbListQueryHandler,
  FindExistingTraktListQueryHandler,
} from './application';

const HANDLERS = [
  CreateAddonConfigCommandHandler,
  UpdateAddonConfigCommandHandler,
  DeleteAddonConfigCommandHandler,
  GetAddonConfigsByOwnerQueryHandler,
  GetAddonConfigByIdQueryHandler,
  FindExistingTmdbListQueryHandler,
  FindExistingTraktListQueryHandler,
];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AddonConfig.name, schema: AddonConfigSchema }]),
  ],
  controllers: [AddonConfigsController],
  providers: [
    ...HANDLERS,
    { provide: AddonConfigsRepository, useClass: MongoAddonConfigsRepository },
  ],
  exports: [AddonConfigsRepository],
})
export class AddonConfigsModule {}
