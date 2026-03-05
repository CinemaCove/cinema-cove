import { UserEntity } from '../../domain';

export class UserResponseDto {
  public readonly id: string;
  public readonly email: string | null;
  public readonly displayName: string | null;
  public readonly passwordHash: string | null;
  public readonly hasPassword: boolean;
  public readonly maxAllowedConfigs: number;
  public readonly tmdbSessionId: string | null;
  public readonly tmdbAccountId: number | null;
  public readonly tmdbUsername: string | null;
  public readonly traktAccessToken: string | null;
  public readonly traktRefreshToken: string | null;
  public readonly traktUsername: string | null;
  public readonly traktExpiresAt: number | null;
  public readonly role: 'user' | 'admin';
  public readonly triviaOptOut: boolean;
  public readonly seenDailyContentIds: string[];

  constructor(user: UserEntity) {
    this.id = user.id!;
    this.email = user.email;
    this.displayName = user.displayName;
    this.passwordHash = user.passwordHash;
    this.hasPassword = user.hasPassword();
    this.maxAllowedConfigs = user.maxAllowedConfigs;
    this.tmdbSessionId = user.tmdbSessionId;
    this.tmdbAccountId = user.tmdbAccountId;
    this.tmdbUsername = user.tmdbUsername;
    this.traktAccessToken = user.traktAccessToken;
    this.traktRefreshToken = user.traktRefreshToken;
    this.traktUsername = user.traktUsername;
    this.traktExpiresAt = user.traktExpiresAt;
    this.role = user.role;
    this.triviaOptOut = user.triviaOptOut;
    this.seenDailyContentIds = user.seenDailyContentIds;
  }
}
