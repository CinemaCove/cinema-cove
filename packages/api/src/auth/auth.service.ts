import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<{ token: string }> {
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const user = await this.usersService.create({ email, passwordHash, displayName });
    return { token: this.signJwt(user) };
  }

  async validateLocalUser(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) return null;
    const valid = await argon2.verify(user.passwordHash, password);
    return valid ? user : null;
  }

  async loginOrCreateOAuthUser(
    provider: string,
    providerId: string,
    email?: string,
    displayName?: string,
  ): Promise<{ token: string }> {
    let user = await this.usersService.findByOAuth(provider, providerId);
    if (user) return { token: this.signJwt(user) };

    if (email) {
      user = await this.usersService.findByEmail(email);
      if (user) {
        await this.usersService.addOAuthProvider(user.id as string, provider, providerId);
        return { token: this.signJwt(user) };
      }
    }

    user = await this.usersService.create({
      email,
      displayName,
      oauthProviders: [{ provider: provider as 'google' | 'facebook', providerId }],
    });
    return { token: this.signJwt(user) };
  }

  signJwt(user: UserDocument): string {
    return this.jwtService.sign({ sub: user.id as string, email: user.email });
  }
}
