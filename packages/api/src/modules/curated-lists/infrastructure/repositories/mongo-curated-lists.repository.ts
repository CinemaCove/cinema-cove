import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CuratedListsRepository } from '../../domain/repositories/curated-lists.repository';
import { CuratedListEntity } from '../../domain/entities/curated-list.entity';
import { CuratedListDocument, CuratedListSchemaClass } from '../schemas/curated-list.schema';

@Injectable()
export class MongoCuratedListsRepository extends CuratedListsRepository {
  constructor(
    @InjectModel(CuratedListSchemaClass.name)
    private readonly model: Model<CuratedListDocument>,
  ) {
    super();
  }

  async findAll(): Promise<CuratedListEntity[]> {
    const docs = await this.model.find().sort({ order: 1 }).exec();
    return docs.map((d) => this.toEntity(d));
  }

  async findById(id: string): Promise<CuratedListEntity | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  private toEntity(doc: CuratedListDocument): CuratedListEntity {
    const entity = new CuratedListEntity();
    entity.id = doc._id.toString();
    entity.tmdbListId = doc.tmdbListId;
    entity.name = doc.name;
    entity.description = doc.description;
    entity.imagePath = doc.imagePath ?? null;
    entity.icon = doc.icon;
    entity.order = doc.order;
    entity.unified = doc.unified ?? false;
    return entity;
  }
}
