import { CommandBus, CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { InstallTraktListCommand } from './install-trakt-list.command';
import { InstallListResponseDto } from '../dtos';
import { GetUserByIdQuery } from '../../../users/application/queries/get-user-by-id.query';
import type { UserResponseDto } from '../../../users/application/dtos/user-response.dto';
import { FindExistingTraktListQuery } from '../../../addon-configs/application/queries/find-existing-trakt-list.query';
import { CreateAddonConfigCommand } from '../../../addon-configs/application/commands/create-addon-config.command';
import type { AddonConfigResponseDto } from '../../../addon-configs/application/dtos/addon-config-response.dto';
import { TRAKT_BUILTIN_LISTS } from '../../integrations.constants';

@CommandHandler(InstallTraktListCommand)
export class InstallTraktListCommandHandler
  implements ICommandHandler<InstallTraktListCommand, InstallListResponseDto>
{
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: InstallTraktListCommand): Promise<InstallListResponseDto> {
    const { userId, body, host } = command;

    const user = await this.queryBus.execute<GetUserByIdQuery, UserResponseDto | null>(
      new GetUserByIdQuery(userId),
    );
    const maxAllowed = user?.maxAllowedConfigs ?? 20;

    let config: AddonConfigResponseDto | null;

    if (body.kind === 'builtin') {
      const def = TRAKT_BUILTIN_LISTS.find((d) => d.listType === body.listType && d.type === body.type);
      if (!def) throw new BadRequestException('Invalid built-in Trakt list');

      config = await this.queryBus.execute(
        new FindExistingTraktListQuery(userId, { traktListType: body.listType, type: body.type }),
      );

      if (!config) {
        config = await this.commandBus.execute(
          new CreateAddonConfigCommand(userId, {
            name: body.label, type: body.type, languages: [], sort: 'popularity.desc',
            source: 'trakt-list', traktListType: body.listType,
          }, maxAllowed),
        );
      }
    } else {
      if (!body.listId || !body.name) throw new BadRequestException('listId and name are required');

      config = await this.queryBus.execute(
        new FindExistingTraktListQuery(userId, { traktListId: body.listId }),
      );

      if (!config) {
        config = await this.commandBus.execute(
          new CreateAddonConfigCommand(userId, {
            name: body.name, type: 'movie', languages: [], sort: 'popularity.desc',
            source: 'trakt-list', traktListId: body.listId,
          }, maxAllowed),
        );
      }
    }

    const installUrl = `stremio://${host}/api/${config.id}/manifest.json`;
    return new InstallListResponseDto(config.id, installUrl);
  }
}
