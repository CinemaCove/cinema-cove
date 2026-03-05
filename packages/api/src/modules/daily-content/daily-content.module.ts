import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyContentSchemaClass, DailyContentSchema } from './infrastructure/schemas/daily-content.schema';
import { MongoDailyContentRepository } from './infrastructure/repositories/mongo-daily-content.repository';
import { DailyContentRepository } from './domain/repositories/daily-content.repository';
import { AdminDailyContentController } from './admin-daily-content.controller';
import { DailyContentController } from './daily-content.controller';
import { GetAllDailyContentQueryHandler } from './application/queries/get-all-daily-content-query.handler';
import { GetTodaysDailyContentQueryHandler } from './application/queries/get-todays-daily-content-query.handler';
import { CreateDailyContentCommandHandler } from './application/commands/create-daily-content-command.handler';
import { UpdateDailyContentCommandHandler } from './application/commands/update-daily-content-command.handler';
import { DeleteDailyContentCommandHandler } from './application/commands/delete-daily-content-command.handler';
import { MarkDailyContentSeenCommandHandler } from './application/commands/mark-daily-content-seen-command.handler';
import { UsersModule } from '../users/users.module';

const HANDLERS = [
  GetAllDailyContentQueryHandler,
  GetTodaysDailyContentQueryHandler,
  CreateDailyContentCommandHandler,
  UpdateDailyContentCommandHandler,
  DeleteDailyContentCommandHandler,
  MarkDailyContentSeenCommandHandler,
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DailyContentSchemaClass.name, schema: DailyContentSchema },
    ]),
    UsersModule,
  ],
  controllers: [AdminDailyContentController, DailyContentController],
  providers: [
    ...HANDLERS,
    { provide: DailyContentRepository, useClass: MongoDailyContentRepository },
  ],
})
export class DailyContentModule {}
