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

  public async findById(id: string): Promise<UserEntity | null> {
    const doc = await this.userModel.findOne({ _id: id }).exec();
    if (!doc) {
      return null;
    }
    return new UserEntity(
      doc.id,
      doc.email,
      doc.displayName!,
      doc.passwordHash!,
      doc.oauthProviders.map(
        (p) => new OauthProviderEntity(p.provider, p.providerId),
      ),
    );
  }

  public async findByEmail(email: string): Promise<UserEntity | null> {
    const doc = await this.userModel.findOne({ email }).exec();
    if (!doc) {
      return null;
    }
    return new UserEntity(
      doc.id,
      doc.email,
      doc.displayName!,
      doc.passwordHash!,
      doc.oauthProviders.map(
        (p) => new OauthProviderEntity(p.provider, p.providerId),
      ),
    );
  }

  public async findByOAuth(
    provider: string,
    providerId: string,
  ): Promise<UserEntity | null> {
    const doc = await this.userModel
      .findOne({ oauthProviders: { $elemMatch: { provider, providerId } } })
      .exec();

    if (!doc) {
      return null;
    }
    return new UserEntity(
      doc.id,
      doc.email,
      doc.displayName!,
      doc.passwordHash!,
      doc.oauthProviders.map(
        (p) => new OauthProviderEntity(p.provider, p.providerId),
      ),
    );
  }

  public async findByEmailOrOAuthProviders(
    email: string,
    providers: {
      provider: string;
      providerId: string;
    }[],
  ): Promise<UserEntity | null> {
    const providerQueries = providers.map((p) => ({
      oauthProviders: {
        $elemMatch: { provider: p.provider, providerId: p.providerId },
      },
    }));

    const doc = await this.userModel
      .findOne({ $or: [{ email }, ...providerQueries] })
      .exec();

    if (!doc) {
      return null;
    }
    return new UserEntity(
      doc.id,
      doc.email,
      doc.displayName!,
      doc.passwordHash!,
      doc.oauthProviders.map(
        (p) => new OauthProviderEntity(p.provider, p.providerId),
      ),
    );
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
    const created = await this.userModel
      .create({
        email: user.email!,
        displayName: user.displayName!,
        passwordHash: user.passwordHash!,
        oauthProviders: user.oauthProviders,
      });

      return new UserEntity(
        created.id,
        created.email,
        created.displayName!,
        created.passwordHash!,
        [...created.oauthProviders],
      );
  }
}
