import { Command } from '@nestjs/cqrs';

export interface InstallCuratedListResult {
  id: string;
  installUrl: string;
  alreadyInstalled: boolean;
}

export class InstallCuratedListCommand extends Command<InstallCuratedListResult> {
  constructor(
    public readonly userId: string,
    public readonly curatedListId: string,
    public readonly host: string,
  ) {
    super();
  }
}
