import { Command } from '@nestjs/cqrs';

export interface InstallFranchiseGroupResult {
  id: string;
  installUrl: string;
  alreadyInstalled: boolean;
}

export class InstallFranchiseGroupCommand extends Command<InstallFranchiseGroupResult> {
  constructor(
    public readonly userId: string,
    public readonly groupId: string,
    public readonly host: string,
  ) {
    super();
  }
}
