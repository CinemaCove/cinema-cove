import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AddonConfigsRepository, FindExistingTmdbListQuery, FindExistingTraktListQuery, UpdateAddonConfigData } from '../../domain/repositories';
import { AddonConfigEntity } from '../../domain/entities';
import { AddonConfig, AddonConfigDocument } from '../schemas';

@Injectable()
export class MongoAddonConfigsRepository implements AddonConfigsRepository {
  constructor(
    @InjectModel(AddonConfig.name)
    private readonly model: Model<AddonConfigDocument>,
  ) {}

  private toEntity(doc: AddonConfigDocument): AddonConfigEntity {
    return new AddonConfigEntity(
      doc._id.toString(),
      doc.owner.toString(),
      doc.name,
      doc.type,
      doc.languages,
      doc.sort,
      doc.source,
      doc.tmdbListId ?? null,
      doc.tmdbListType ?? null,
      doc.traktListId ?? null,
      doc.traktListType ?? null,
      doc.imagePath ?? null,
      doc.includeAdult ?? false,
      doc.minVoteAverage ?? null,
      doc.minVoteCount ?? null,
      doc.releaseDateFrom ?? null,
      doc.releaseDateTo ?? null,
      doc.curatedGroupId ?? null,
      doc.installedVersion ?? null,
    );
  }

  async findByOwner(userId: string): Promise<AddonConfigEntity[]> {
    const docs = await this.model.find({ owner: new Types.ObjectId(userId) }).exec();
    return docs.map((d) => this.toEntity(d));
  }

  async findById(id: string): Promise<AddonConfigEntity | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async countByOwner(userId: string): Promise<number> {
    return this.model.countDocuments({ owner: new Types.ObjectId(userId) });
  }

  async create(entity: AddonConfigEntity): Promise<AddonConfigEntity> {
    const data: Record<string, unknown> = {
      owner: new Types.ObjectId(entity.owner),
      name: entity.name,
      type: entity.type,
      languages: [...entity.languages],
      sort: entity.sort,
      source: entity.source,
      includeAdult: entity.includeAdult,
    };

    if (entity.curatedGroupId) data['curatedGroupId'] = entity.curatedGroupId;
    if (entity.installedVersion !== null) data['installedVersion'] = entity.installedVersion;
    if (entity.tmdbListId) data['tmdbListId'] = entity.tmdbListId;
    if (entity.tmdbListType) data['tmdbListType'] = entity.tmdbListType;
    if (entity.traktListId) data['traktListId'] = entity.traktListId;
    if (entity.traktListType) data['traktListType'] = entity.traktListType;
    if (entity.imagePath) data['imagePath'] = entity.imagePath;
    if (entity.minVoteAverage !== null) data['minVoteAverage'] = entity.minVoteAverage;
    if (entity.minVoteCount !== null) data['minVoteCount'] = entity.minVoteCount;
    if (entity.releaseDateFrom !== null) data['releaseDateFrom'] = entity.releaseDateFrom;
    if (entity.releaseDateTo !== null) data['releaseDateTo'] = entity.releaseDateTo;

    const doc = await this.model.create(data);
    return this.toEntity(doc);
  }

  async update(
    id: string,
    userId: string,
    data: UpdateAddonConfigData,
  ): Promise<AddonConfigEntity | null> {
    const $set: Record<string, unknown> = {};
    const $unset: Record<string, 1> = {};

    for (const [key, value] of Object.entries(data)) {
      if (value === null) {
        $unset[key] = 1;
      } else if (value !== undefined) {
        $set[key] = value;
      }
    }

    const update: Record<string, unknown> = {};
    if (Object.keys($set).length > 0) update['$set'] = $set;
    if (Object.keys($unset).length > 0) update['$unset'] = $unset;

    const doc = await this.model
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), owner: new Types.ObjectId(userId) },
        update,
        { new: true },
      )
      .exec();

    return doc ? this.toEntity(doc) : null;
  }

  async deleteByOwner(id: string, userId: string): Promise<boolean> {
    const doc = await this.model
      .findOneAndDelete({ _id: new Types.ObjectId(id), owner: new Types.ObjectId(userId) })
      .exec();
    return doc !== null;
  }

  async findExistingTmdbList(
    userId: string,
    query: FindExistingTmdbListQuery,
  ): Promise<AddonConfigEntity | null> {
    const filter: Record<string, unknown> = {
      owner: new Types.ObjectId(userId),
      source: 'tmdb-list',
    };
    if (query.tmdbListType) filter['tmdbListType'] = query.tmdbListType;
    if (query.tmdbListId) filter['tmdbListId'] = query.tmdbListId;
    if (query.type) filter['type'] = query.type;

    const doc = await this.model.findOne(filter).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findExistingFranchiseGroup(
    userId: string,
    curatedGroupId: string,
  ): Promise<AddonConfigEntity | null> {
    const doc = await this.model
      .findOne({ owner: new Types.ObjectId(userId), source: 'franchise-group', curatedGroupId })
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findExistingTraktList(
    userId: string,
    query: FindExistingTraktListQuery,
  ): Promise<AddonConfigEntity | null> {
    const filter: Record<string, unknown> = {
      owner: new Types.ObjectId(userId),
      source: 'trakt-list',
    };
    if (query.traktListType) filter['traktListType'] = query.traktListType;
    if (query.traktListId) filter['traktListId'] = query.traktListId;
    if (query.type) filter['type'] = query.type;

    const doc = await this.model.findOne(filter).exec();
    return doc ? this.toEntity(doc) : null;
  }
}
