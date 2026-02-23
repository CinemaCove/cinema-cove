import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserEntity, UsersRepository } from '../../domain';
import { RegisterUserCommand } from './register-user.command';
import { BadRequestException } from '@nestjs/common';
import { UserResponseDto } from '../dtos';
import { PasswordHasher } from '../../../shared/domain/services/password-hasher';

@CommandHandler(RegisterUserCommand)
export class RegisterUserCommandHandler implements ICommandHandler<
  RegisterUserCommand,
  UserResponseDto
> {
  constructor(
    private usersRepository: UsersRepository,
    private passwordHasher: PasswordHasher,
  ) {}

  public async execute(command: RegisterUserCommand): Promise<UserResponseDto> {
    const existingUser = await this.usersRepository.findByEmail(
      command.dto.email,
    );

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const user = await UserEntity.register(
      command.dto.email,
      command.dto.displayName!,
      command.dto.password,
      [],
      this.passwordHasher,
    );

    const created = await this.usersRepository.create(user);

    return new UserResponseDto(created);
  }
}

