import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CuratedList, CuratedListSchema } from './schemas/curated-list.schema';
import { CuratedListsService } from './curated-lists.service';
import { CuratedListsController } from './curated-lists.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CuratedList.name, schema: CuratedListSchema },
    ]),
  ],
  providers: [CuratedListsService],
  controllers: [CuratedListsController],
})
export class CuratedListsModule {}
