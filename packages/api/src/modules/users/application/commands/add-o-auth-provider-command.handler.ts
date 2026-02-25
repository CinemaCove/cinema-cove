import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddOAuthProviderCommand } from './add-o-auth-provider.command';
import { OauthProviderEntity, UsersRepository } from '../../domain';
import { BadRequestException } from '@nestjs/common';

@CommandHandler(AddOAuthProviderCommand)
export class AddOAuthProviderCommandHandler implements ICommandHandler<AddOAuthProviderCommand> {
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: AddOAuthProviderCommand): Promise<void> {
    const user = await this.usersRepository.findByOAuth(
      command.provider.provider,
      command.provider.providerId,
    );
    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    user.addOAuthProviders([new OauthProviderEntity(
      command.provider.provider,
      command.provider.providerId,
    )]);

    await this.usersRepository.save(user);
  }
}
