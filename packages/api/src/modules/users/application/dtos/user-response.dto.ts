import { UserEntity } from '../../domain';

export class UserResponseDto {
  public readonly id: string;
  public readonly email: string | null;
  public readonly displayName: string | null;
  public readonly passwordHash: string | null;
  public readonly hasPassword: boolean;
  public readonly maxAllowedConfigs: number;

  constructor(user: UserEntity) {
    this.id = user.id!;
    this.email = user.email;
    this.displayName = user.displayName;
    this.passwordHash = user.passwordHash;
    this.hasPassword = user.hasPassword();
    this.maxAllowedConfigs = user.maxAllowedConfigs;
  }
}
