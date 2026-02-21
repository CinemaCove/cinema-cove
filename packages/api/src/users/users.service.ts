import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  findByOAuth(provider: string, providerId: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ oauthProviders: { $elemMatch: { provider, providerId } } })
      .exec();
  }

  create(data: Partial<User>): Promise<UserDocument> {
    return this.userModel.create(data);
  }

  async addOAuthProvider(userId: string, provider: string, providerId: string): Promise<void> {
    await this.userModel
      .updateOne({ _id: userId }, { $push: { oauthProviders: { provider, providerId } } })
      .exec();
  }

  async saveTmdbSession(
    userId: string,
    sessionId: string,
    accountId: number,
    username: string,
  ): Promise<void> {
    await this.userModel
      .updateOne(
        { _id: userId },
        { tmdbSessionId: sessionId, tmdbAccountId: accountId, tmdbUsername: username },
      )
      .exec();
  }

  async clearTmdbSession(userId: string): Promise<void> {
    await this.userModel
      .updateOne(
        { _id: userId },
        { $unset: { tmdbSessionId: '', tmdbAccountId: '', tmdbUsername: '' } },
      )
      .exec();
  }

  async saveTraktTokens(
    userId: string,
    data: { accessToken: string; refreshToken: string; username: string; expiresAt: number },
  ): Promise<void> {
    await this.userModel
      .updateOne(
        { _id: userId },
        {
          traktAccessToken: data.accessToken,
          traktRefreshToken: data.refreshToken,
          traktUsername: data.username,
          traktExpiresAt: data.expiresAt,
        },
      )
      .exec();
  }

  async clearTraktTokens(userId: string): Promise<void> {
    await this.userModel
      .updateOne(
        { _id: userId },
        { $unset: { traktAccessToken: '', traktRefreshToken: '', traktUsername: '', traktExpiresAt: '' } },
      )
      .exec();
  }

  async updateDisplayName(userId: string, displayName: string): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { displayName }).exec();
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.userModel.findById(userId).exec();
    if (!user?.passwordHash) return false;
    const valid = await argon2.verify(user.passwordHash, currentPassword);
    if (!valid) return false;
    const passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });
    await this.userModel.updateOne({ _id: userId }, { passwordHash }).exec();
    return true;
  }

  async setPassword(userId: string, newPassword: string): Promise<void> {
    const passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });
    await this.userModel.updateOne({ _id: userId }, { passwordHash }).exec();
  }
}
