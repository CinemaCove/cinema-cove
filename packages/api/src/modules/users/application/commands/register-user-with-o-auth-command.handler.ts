import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterUserWithOAuthCommand } from './register-user-with-o-auth.command';
import {
  OauthProviderEntity,
  UserEntity,
  UsersRepository,
} from '../../domain';
import { BadRequestException } from '@nestjs/common';
import { UserResponseDto } from '../dtos';
import { PasswordHasher } from '../../../shared/domain/services/password-hasher';

@CommandHandler(RegisterUserWithOAuthCommand)
export class RegisterUserWithOAuthCommandHandler implements ICommandHandler<
  RegisterUserWithOAuthCommand,
  UserResponseDto
> {
  constructor(
    private usersRepository: UsersRepository,
    private passwordHasher: PasswordHasher,
  ) {}

  public async execute(
    command: RegisterUserWithOAuthCommand,
  ): Promise<UserResponseDto> {
    const existingUser = await this.usersRepository.findByEmailOrOAuthProviders(
      command.email,
      command.providers.map((p) => {
        return {
          provider: p.provider,
          providerId: p.providerId,
        };
      }),
    );

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const user = await UserEntity.register(
      command.email,
      command.displayName!,
      null,
      20,
      command.providers.map((p) => {
        return new OauthProviderEntity(p.provider, p.providerId);
      }),
      this.passwordHasher,
    );

    const created = await this.usersRepository.create(user);

    return new UserResponseDto(created);
  }
}
