import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CuratedListsController } from './curated-lists.controller';
import { CuratedListSchemaClass, CuratedListSchema } from './infrastructure/schemas/curated-list.schema';
import { MongoCuratedListsRepository } from './infrastructure/repositories/mongo-curated-lists.repository';
import { CuratedListsRepository } from './domain/repositories/curated-lists.repository';
import { GetAllCuratedListsQueryHandler } from './application/queries/get-all-curated-lists-query.handler';
import { GetCuratedListByIdQueryHandler } from './application/queries/get-curated-list-by-id-query.handler';
import { InstallCuratedListCommandHandler } from './application/commands/install-curated-list-command.handler';

const HANDLERS = [
  GetAllCuratedListsQueryHandler,
  GetCuratedListByIdQueryHandler,
  InstallCuratedListCommandHandler,
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CuratedListSchemaClass.name, schema: CuratedListSchema },
    ]),
  ],
  controllers: [CuratedListsController],
  providers: [
    ...HANDLERS,
    { provide: CuratedListsRepository, useClass: MongoCuratedListsRepository },
  ],
})
export class CuratedListsModule {}
