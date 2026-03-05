import { OauthProviderEntity } from './oauth-provider.entity';
import { PasswordHasher } from '../../../shared/domain/services/password-hasher';

export class UserEntity {
  public tmdbSessionId: string | null = null;
  public tmdbAccountId: number | null = null;
  public tmdbUsername: string | null = null;
  public traktAccessToken: string | null = null;
  public traktRefreshToken: string | null = null;
  public traktUsername: string | null = null;
  public traktExpiresAt: number | null = null;
  public role: 'user' | 'admin' = 'user';
  public triviaOptOut: boolean = false;
  public seenDailyContentIds: string[] = [];

  constructor(
    public id: string | null,
    public email: string | null,
    public displayName: string | null,
    public passwordHash: string | null,
    public maxAllowedConfigs: number,
    public oauthProviders: OauthProviderEntity[],
  ) {}

  public updateDisplayName(name?: string) {
    if (!name) {
      throw new Error('Name cannot be empty');
    }

    this.displayName = name;
  }

  public hasPassword() {
    return !!this.passwordHash;
  }

  public async changePassword(
    currentPassword: string,
    newPassword: string,
    passwordHasher: PasswordHasher,
  ) {
    if (!this.passwordHash) {
      throw new Error('User has no password set');
    }

    const valid = await passwordHasher.verify(
      this.passwordHash,
      currentPassword,
    );

    if (valid) {
      throw new Error('Current password is incorrect');
    }

    if (!this.isStrongPassword(newPassword)) {
      throw new Error('Password too weak');
    }

    this.passwordHash = await passwordHasher.hash(newPassword);
  }

  public addOAuthProviders(providers: OauthProviderEntity[]) {
    this.oauthProviders.push(...providers);
  }

  public static async register(
    email: string | null,
    displayName: string | null,
    password: string | null,
    maxAllowedConfigs: number,
    oauthProviders: OauthProviderEntity[],
    passwordHasher: PasswordHasher,
  ): Promise<UserEntity> {
    // TODO: Verify this stuff
    const hashedPassword = !password
      ? null
      : await passwordHasher.hash(password);

    return new UserEntity(
      null,
      email,
      displayName,
      hashedPassword,
      maxAllowedConfigs,
      oauthProviders,
    );
  }

  private isStrongPassword(password: string) {
    return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  }
}
