import { Command } from '@nestjs/cqrs';

export class UpdateProfileCommand extends Command<void> {
  public constructor(
    public id: string,
    public displayName?: string,
    public currentPassword?: string,
    public newPassword?: string,
    public triviaOptOut?: boolean,
    public funFactOptOut?: boolean,
  ) {
    super();
  }
}
