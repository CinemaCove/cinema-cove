import { Module } from '@nestjs/common';
import { TmdbModule } from '../shared/infrastructure/tmdb/tmdb.module';
import { TraktModule } from '../shared/infrastructure/trakt/trakt.module';
import { IntegrationsController } from './integrations.controller';
import {
  ConnectTmdbCommandHandler,
  HandleTmdbCallbackCommandHandler,
  DisconnectTmdbCommandHandler,
  InstallTmdbListCommandHandler,
  ConnectTraktCommandHandler,
  HandleTraktCallbackCommandHandler,
  DisconnectTraktCommandHandler,
  InstallTraktListCommandHandler,
} from './application/commands';
import {
  GetTmdbStatusQueryHandler,
  GetTraktStatusQueryHandler,
  GetTmdbListsQueryHandler,
  GetTraktListsQueryHandler,
} from './application/queries';

const HANDLERS = [
  ConnectTmdbCommandHandler,
  HandleTmdbCallbackCommandHandler,
  DisconnectTmdbCommandHandler,
  InstallTmdbListCommandHandler,
  ConnectTraktCommandHandler,
  HandleTraktCallbackCommandHandler,
  DisconnectTraktCommandHandler,
  InstallTraktListCommandHandler,
  GetTmdbStatusQueryHandler,
  GetTraktStatusQueryHandler,
  GetTmdbListsQueryHandler,
  GetTraktListsQueryHandler,
];

@Module({
  imports: [TmdbModule, TraktModule],
  controllers: [IntegrationsController],
  providers: HANDLERS,
})
export class IntegrationsModule {}
