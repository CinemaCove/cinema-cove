import { Command } from '@nestjs/cqrs';
import { OAuthProviderDto, UserResponseDto } from '../dtos';

export class RegisterUserWithOAuthCommand extends Command<UserResponseDto> {
  constructor(
    public readonly email: string | null,
    public readonly displayName: string | null,
    public readonly providers: Readonly<OAuthProviderDto[]>,
  ) {
    super();
  }
}