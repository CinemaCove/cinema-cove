import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnnouncementSchemaClass, AnnouncementSchema } from './infrastructure/schemas/announcement.schema';
import { MongoAnnouncementRepository } from './infrastructure/repositories/mongo-announcement.repository';
import { AnnouncementRepository } from './domain/repositories/announcement.repository';
import { AnnouncementsController } from './announcements.controller';
import { AdminAnnouncementsController } from './admin-announcements.controller';
import { UsersModule } from '../users/users.module';
import { GetAnnouncementsQueryHandler } from './application/queries/get-announcements-query.handler';
import { GetAllAnnouncementsQueryHandler } from './application/queries/get-all-announcements-query.handler';
import { GetUnreadCountQueryHandler } from './application/queries/get-unread-count-query.handler';
import { CreateAnnouncementCommandHandler } from './application/commands/create-announcement-command.handler';
import { UpdateAnnouncementCommandHandler } from './application/commands/update-announcement-command.handler';
import { DeleteAnnouncementCommandHandler } from './application/commands/delete-announcement-command.handler';
import { MarkAnnouncementsReadCommandHandler } from './application/commands/mark-announcements-read-command.handler';

const HANDLERS = [
  GetAnnouncementsQueryHandler,
  GetAllAnnouncementsQueryHandler,
  GetUnreadCountQueryHandler,
  CreateAnnouncementCommandHandler,
  UpdateAnnouncementCommandHandler,
  DeleteAnnouncementCommandHandler,
  MarkAnnouncementsReadCommandHandler,
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnnouncementSchemaClass.name, schema: AnnouncementSchema },
    ]),
    UsersModule,
  ],
  controllers: [AnnouncementsController, AdminAnnouncementsController],
  providers: [
    ...HANDLERS,
    { provide: AnnouncementRepository, useClass: MongoAnnouncementRepository },
  ],
})
export class AnnouncementsModule {}
