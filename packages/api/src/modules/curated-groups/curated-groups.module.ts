import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CuratedGroupsController } from './curated-groups.controller';
import { CuratedGroupSchemaClass, CuratedGroupSchema } from './infrastructure/schemas/curated-group.schema';
import { MongoCuratedGroupsRepository } from './infrastructure/repositories/mongo-curated-groups.repository';
import { CuratedGroupsRepository } from './domain/repositories/curated-groups.repository';
import { GetAllCuratedGroupsQueryHandler } from './application/queries/get-all-curated-groups-query.handler';
import { GetCuratedGroupByIdQueryHandler } from './application/queries/get-curated-group-by-id-query.handler';
import { InstallFranchiseGroupCommandHandler } from './application/commands/install-franchise-group-command.handler';

const HANDLERS = [
  GetAllCuratedGroupsQueryHandler,
  GetCuratedGroupByIdQueryHandler,
  InstallFranchiseGroupCommandHandler,
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CuratedGroupSchemaClass.name, schema: CuratedGroupSchema },
    ]),
  ],
  controllers: [CuratedGroupsController],
  providers: [
    ...HANDLERS,
    { provide: CuratedGroupsRepository, useClass: MongoCuratedGroupsRepository },
  ],
})
export class CuratedGroupsModule {}
