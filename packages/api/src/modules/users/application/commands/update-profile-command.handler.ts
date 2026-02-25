import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../domain';
import { NotFoundException } from '@nestjs/common';
import { UpdateProfileCommand } from './update-profile.command';
import { PasswordHasher } from '../../../shared/domain/services/password-hasher';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileCommandHandler implements ICommandHandler<
  UpdateProfileCommand,
  void
> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  public async execute(command: UpdateProfileCommand): Promise<void> {
    const user = await this.usersRepository.findById(command.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (command.displayName) {
      user.updateDisplayName(command.displayName);
    }

    if (command.newPassword) {
      await user.changePassword(
        command.currentPassword!,
        command.newPassword,
        this.passwordHasher,
      );
    }

    await this.usersRepository.save(user);
  }
}
