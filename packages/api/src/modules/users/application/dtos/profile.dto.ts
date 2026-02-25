import { UserEntity } from '../../domain';

export class ProfileDto {
  public readonly email: string | null;
  public readonly displayName: string | null;
  public readonly hasPassword: boolean;

  constructor(user: UserEntity) {
    this.email = user.email;
    this.displayName = user.displayName;
    this.hasPassword = user.hasPassword();
  }
}
