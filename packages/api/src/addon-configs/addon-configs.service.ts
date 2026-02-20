import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AddonConfig, AddonConfigDocument } from './schemas/addon-config.schema';

interface CreateAddonConfigDto {
  name: string;
  type: 'movie' | 'tv';
  languages: string[];
  sort: string;
  source?: 'discover' | 'tmdb-list';
  tmdbListType?: 'watchlist' | 'favorites' | 'rated';
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

  create(userId: string, data: CreateAddonConfigDto): Promise<AddonConfigDocument> {
    return this.addonConfigModel.create({ owner: new Types.ObjectId(userId), ...data });
  }

  findByOwner(userId: string): Promise<AddonConfigDocument[]> {
    return this.addonConfigModel.find({ owner: new Types.ObjectId(userId) }).exec();
  }

  findById(id: string): Promise<AddonConfigDocument | null> {
    return this.addonConfigModel.findById(id).exec();
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
