import { CommandBus, CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { InstallFranchiseGroupCommand, InstallFranchiseGroupResult } from './install-franchise-group.command';
import { GetCuratedGroupByIdQuery } from '../queries/get-curated-group-by-id.query';
import type { CuratedGroupDto } from '../dtos/curated-group.dto';
import { FindExistingFranchiseGroupQuery } from '../../../addon-configs/application/queries/find-existing-franchise-group.query';
import type { AddonConfigResponseDto } from '../../../addon-configs/application/dtos/addon-config-response.dto';
import { GetUserByIdQuery } from '../../../users/application/queries/get-user-by-id.query';
import type { UserResponseDto } from '../../../users/application/dtos/user-response.dto';
import { CreateAddonConfigCommand } from '../../../addon-configs/application/commands/create-addon-config.command';
import { UpdateAddonConfigCommand } from '../../../addon-configs/application/commands/update-addon-config.command';

@CommandHandler(InstallFranchiseGroupCommand)
export class InstallFranchiseGroupCommandHandler
  implements ICommandHandler<InstallFranchiseGroupCommand, InstallFranchiseGroupResult>
{
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: InstallFranchiseGroupCommand): Promise<InstallFranchiseGroupResult> {
    const group = await this.queryBus.execute<GetCuratedGroupByIdQuery, CuratedGroupDto | null>(
      new GetCuratedGroupByIdQuery(command.groupId),
    );
    if (!group) throw new NotFoundException('Franchise group not found');

    const existing = await this.queryBus.execute<
      FindExistingFranchiseGroupQuery,
      AddonConfigResponseDto | null
    >(new FindExistingFranchiseGroupQuery(command.userId, command.groupId));

    if (existing) {
      await this.commandBus.execute(
        new UpdateAddonConfigCommand(existing.id, command.userId, { installedVersion: group.changeVersion }),
      );
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
          source: 'franchise-group',
          curatedGroupId: command.groupId,
          name: group.name.slice(0, 20),
          type: 'movie',
          languages: [],
          sort: 'popularity.desc',
          includeAdult: false,
          imagePath: group.imagePath ?? undefined,
          installedVersion: group.changeVersion,
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
