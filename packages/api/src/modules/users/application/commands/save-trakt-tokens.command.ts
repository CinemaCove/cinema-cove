import { Command } from '@nestjs/cqrs';

export class SaveTraktTokensCommand extends Command<void> {
  constructor(
    public readonly userId: string,
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly username: string,
    public readonly expiresAt: number,
  ) {
    super();
  }
}
