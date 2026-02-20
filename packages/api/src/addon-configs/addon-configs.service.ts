import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AddonConfig, AddonConfigDocument } from './schemas/addon-config.schema';

const MAX_CONFIGS_PER_USER = 20;

interface CreateAddonConfigDto {
  name: string;
  type: 'movie' | 'tv';
  languages: string[];
  sort: string;
  source?: 'discover' | 'tmdb-list' | 'trakt-list';
  tmdbListId?: string;
  tmdbListType?: 'watchlist' | 'favorites' | 'rated';
  traktListId?: string;
  traktListType?: 'watchlist' | 'favorites' | 'rated';
}

interface UpdateAddonConfigDto {
  name?: string;
  type?: 'movie' | 'tv';
  languages?: string[];
  sort?: string;
}

@Injectable()
export class AddonConfigsService {
  constructor(
    @InjectModel(AddonConfig.name)
    private readonly addonConfigModel: Model<AddonConfigDocument>,
  ) {}

  async create(userId: string, data: CreateAddonConfigDto): Promise<AddonConfigDocument> {
    const count = await this.addonConfigModel.countDocuments({ owner: new Types.ObjectId(userId) });
    if (count >= MAX_CONFIGS_PER_USER) {
      throw new ForbiddenException(`You have reached the limit of ${MAX_CONFIGS_PER_USER} addon configurations.`);
    }
    return this.addonConfigModel.create({ owner: new Types.ObjectId(userId), ...data });
  }

  findByOwner(userId: string): Promise<AddonConfigDocument[]> {
    return this.addonConfigModel.find({ owner: new Types.ObjectId(userId) }).exec();
  }

  findById(id: string): Promise<AddonConfigDocument | null> {
    return this.addonConfigModel.findById(id).exec();
  }

  findExistingTmdbList(
    userId: string,
    query: { tmdbListType?: string; tmdbListId?: string; type?: string },
  ): Promise<AddonConfigDocument | null> {
    const filter: Record<string, unknown> = {
      owner: new Types.ObjectId(userId),
      source: 'tmdb-list',
    };
    if (query.tmdbListType) filter['tmdbListType'] = query.tmdbListType;
    if (query.tmdbListId) filter['tmdbListId'] = query.tmdbListId;
    if (query.type) filter['type'] = query.type;
    return this.addonConfigModel.findOne(filter).exec();
  }

  findExistingTraktList(
    userId: string,
    query: { traktListType?: string; traktListId?: string; type?: string },
  ): Promise<AddonConfigDocument | null> {
    const filter: Record<string, unknown> = {
      owner: new Types.ObjectId(userId),
      source: 'trakt-list',
    };
    if (query.traktListType) filter['traktListType'] = query.traktListType;
    if (query.traktListId) filter['traktListId'] = query.traktListId;
    if (query.type) filter['type'] = query.type;
    return this.addonConfigModel.findOne(filter).exec();
  }

  updateByOwner(id: string, userId: string, data: UpdateAddonConfigDto): Promise<AddonConfigDocument | null> {
    return this.addonConfigModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), owner: new Types.ObjectId(userId) },
        { $set: data },
        { new: true },
      )
      .exec();
  }

  deleteByOwner(id: string, userId: string): Promise<AddonConfigDocument | null> {
    return this.addonConfigModel
      .findOneAndDelete({ _id: new Types.ObjectId(id), owner: new Types.ObjectId(userId) })
      .exec();
  }
}
