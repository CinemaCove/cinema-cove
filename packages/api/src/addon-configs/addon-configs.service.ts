import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AddonConfig, AddonConfigDocument } from './schemas/addon-config.schema';

interface CreateAddonConfigDto {
  name: string;
  type: 'movie' | 'tv';
  languages: string[];
  sort: string;
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
}
