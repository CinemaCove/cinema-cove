import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../domain/repositories/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { UserEntity } from '../../domain/entities/user.entity';
import { OauthProviderEntity } from '../../domain';

@Injectable()
export class MongoUsersRepository implements UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  private toEntity(doc: UserDocument): UserEntity {
    const entity = new UserEntity(
      doc.id,
      doc.email,
      doc.displayName ?? null,
      doc.passwordHash ?? null,
      doc.maxAllowedConfigs,
      doc.oauthProviders.map((p) => new OauthProviderEntity(p.provider, p.providerId)),
    );
    entity.tmdbSessionId = doc.tmdbSessionId ?? null;
    entity.tmdbAccountId = doc.tmdbAccountId ?? null;
    entity.tmdbUsername = doc.tmdbUsername ?? null;
    entity.traktAccessToken = doc.traktAccessToken ?? null;
    entity.traktRefreshToken = doc.traktRefreshToken ?? null;
    entity.traktUsername = doc.traktUsername ?? null;
    entity.traktExpiresAt = doc.traktExpiresAt ?? null;
    entity.role = doc.role ?? 'user';
    entity.triviaOptOut = doc.triviaOptOut ?? false;
    entity.seenDailyContentIds = doc.seenDailyContentIds ?? [];
    entity.announcementsLastReadAt = doc.announcementsLastReadAt ?? null;
    return entity;
  }

  public async findById(id: string): Promise<UserEntity | null> {
    const doc = await this.userModel.findOne({ _id: id }).exec();
    return doc ? this.toEntity(doc) : null;
  }

  public async findByEmail(email: string): Promise<UserEntity | null> {
    const doc = await this.userModel.findOne({ email }).exec();
    return doc ? this.toEntity(doc) : null;
  }

  public async findByOAuth(
    provider: string,
    providerId: string,
  ): Promise<UserEntity | null> {
    const doc = await this.userModel
      .findOne({ oauthProviders: { $elemMatch: { provider, providerId } } })
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  public async findByEmailOrOAuthProviders(
    email: string,
    providers: { provider: string; providerId: string }[],
  ): Promise<UserEntity | null> {
    const providerQueries = providers.map((p) => ({
      oauthProviders: { $elemMatch: { provider: p.provider, providerId: p.providerId } },
    }));
    const doc = await this.userModel
      .findOne({ $or: [{ email }, ...providerQueries] })
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  public async save(user: UserEntity): Promise<void> {
    const result = await this.userModel
      .updateOne(
        {
          _id: user.id,
        },
        {
          $set: {
            displayName: user.displayName,
            passwordHash: user.passwordHash,
            oauthProviders: user.oauthProviders,
          },
        },
        { upsert: false },
      )
      .exec();

    if (result.matchedCount === 0) {
      throw new Error('User not found');
    }
  }

  public async create(user: UserEntity): Promise<UserEntity> {
    const created = await this.userModel.create({
      email: user.email!,
      displayName: user.displayName!,
      passwordHash: user.passwordHash!,
      maxAllowedConfigs: user.maxAllowedConfigs,
      oauthProviders: user.oauthProviders,
    });
    return this.toEntity(created);
  }

  public async saveTmdbSession(userId: string, sessionId: string, accountId: number, username: string): Promise<void> {
    await this.userModel
      .updateOne({ _id: userId }, { tmdbSessionId: sessionId, tmdbAccountId: accountId, tmdbUsername: username })
      .exec();
  }

  public async clearTmdbSession(userId: string): Promise<void> {
    await this.userModel
      .updateOne({ _id: userId }, { $unset: { tmdbSessionId: '', tmdbAccountId: '', tmdbUsername: '' } })
      .exec();
  }

  public async saveTraktTokens(userId: string, accessToken: string, refreshToken: string, username: string, expiresAt: number): Promise<void> {
    await this.userModel
      .updateOne({ _id: userId }, { traktAccessToken: accessToken, traktRefreshToken: refreshToken, traktUsername: username, traktExpiresAt: expiresAt })
      .exec();
  }

  public async clearTraktTokens(userId: string): Promise<void> {
    await this.userModel
      .updateOne({ _id: userId }, { $unset: { traktAccessToken: '', traktRefreshToken: '', traktUsername: '', traktExpiresAt: '' } })
      .exec();
  }

  public async updateTriviaOptOut(userId: string, optOut: boolean): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { triviaOptOut: optOut }).exec();
  }

  public async addSeenDailyContent(userId: string, contentId: string): Promise<void> {
    await this.userModel
      .updateOne({ _id: userId }, { $addToSet: { seenDailyContentIds: contentId } })
      .exec();
  }

  public async updateAnnouncementsLastReadAt(userId: string, date: Date): Promise<void> {
    await this.userModel
      .updateOne({ _id: userId }, { announcementsLastReadAt: date })
      .exec();
  }
}
