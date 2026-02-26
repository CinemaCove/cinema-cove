import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CuratedGroupsRepository } from '../../domain/repositories/curated-groups.repository';
import { CuratedGroupEntity } from '../../domain/entities/curated-group.entity';
import { CuratedGroupDocument, CuratedGroupSchemaClass } from '../schemas/curated-group.schema';

@Injectable()
export class MongoCuratedGroupsRepository extends CuratedGroupsRepository {
  constructor(
    @InjectModel(CuratedGroupSchemaClass.name)
    private readonly model: Model<CuratedGroupDocument>,
  ) {
    super();
  }

  async findAll(): Promise<CuratedGroupEntity[]> {
    const docs = await this.model.find().sort({ order: 1 }).exec();
    return docs.map((d) => this.toEntity(d));
  }

  async findById(id: string): Promise<CuratedGroupEntity | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  private toEntity(doc: CuratedGroupDocument): CuratedGroupEntity {
    const entity = new CuratedGroupEntity();
    entity.id = doc._id.toString();
    entity.name = doc.name;
    entity.description = doc.description;
    entity.imagePath = doc.imagePath ?? null;
    entity.icon = doc.icon;
    entity.order = doc.order;
    entity.lists = doc.lists.map((l) => ({
      name: l.name,
      tmdbListId: l.tmdbListId,
      unified: l.unified ?? false,
    }));
    entity.changeVersion = doc.changeVersion ?? 1;
    return entity;
  }
}
