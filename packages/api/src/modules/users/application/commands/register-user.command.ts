import { Command } from '@nestjs/cqrs';
import { RegisterUserDto, UserResponseDto } from '../dtos';

export class RegisterUserCommand extends Command<UserResponseDto> {
  constructor(public readonly dto: RegisterUserDto) {
    super();
  }
}
