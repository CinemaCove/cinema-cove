import { CommandBus, CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { InstallCuratedListCommand, InstallCuratedListResult } from './install-curated-list.command';
import { GetCuratedListByIdQuery } from '../queries/get-curated-list-by-id.query';
import type { CuratedListDto } from '../dtos/curated-list.dto';
import { FindExistingTmdbListQuery } from '../../../addon-configs/application/queries/find-existing-tmdb-list.query';
import type { AddonConfigResponseDto } from '../../../addon-configs/application/dtos/addon-config-response.dto';
import { GetUserByIdQuery } from '../../../users/application/queries/get-user-by-id.query';
import type { UserResponseDto } from '../../../users/application/dtos/user-response.dto';
import { CreateAddonConfigCommand } from '../../../addon-configs/application/commands/create-addon-config.command';

@CommandHandler(InstallCuratedListCommand)
export class InstallCuratedListCommandHandler
  implements ICommandHandler<InstallCuratedListCommand, InstallCuratedListResult>
{
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: InstallCuratedListCommand): Promise<InstallCuratedListResult> {
    const curatedList = await this.queryBus.execute<GetCuratedListByIdQuery, CuratedListDto | null>(
      new GetCuratedListByIdQuery(command.curatedListId),
    );
    if (!curatedList) throw new NotFoundException('Curated list not found');

    const existing = await this.queryBus.execute<
      FindExistingTmdbListQuery,
      AddonConfigResponseDto | null
    >(new FindExistingTmdbListQuery(command.userId, { tmdbListId: curatedList.tmdbListId }));

    if (existing) {
      return {
        id: existing.id,
        installUrl: `stremio://${command.host}/api/${existing.id}/manifest.json`,
        alreadyInstalled: true,
      };
    }

    const user = await this.queryBus.execute<GetUserByIdQuery, UserResponseDto | null>(
      new GetUserByIdQuery(command.userId),
    );

    const created = await this.commandBus.execute<CreateAddonConfigCommand, AddonConfigResponseDto>(
      new CreateAddonConfigCommand(
        command.userId,
        {
          source: curatedList.unified ? 'curated-list' : 'tmdb-list',
          tmdbListId: curatedList.tmdbListId,
          name: curatedList.name.slice(0, 20),
          type: 'movie',
          languages: ['en'],
          sort: 'popularity.desc',
          includeAdult: false,
          imagePath: curatedList.imagePath ?? undefined,
        },
        user?.maxAllowedConfigs ?? 20,
      ),
    );

    return {
      id: created.id,
      installUrl: `stremio://${command.host}/api/${created.id}/manifest.json`,
      alreadyInstalled: false,
    };
  }
}
