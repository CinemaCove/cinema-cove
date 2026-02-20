import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
}
