import { UserEntity } from '../entities/user.entity';

export abstract class UsersRepository {
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract save(user: UserEntity): Promise<void>;
  abstract create(user: UserEntity): Promise<UserEntity>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findByOAuth(
    provider: string,
    providerId: string,
  ): Promise<UserEntity | null>;
  abstract findByEmailOrOAuthProviders(
    email: string | null,
    providers: {
      provider: string;
      providerId: string;
    }[],
  ): Promise<UserEntity | null>;
}
