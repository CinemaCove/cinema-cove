import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AnnouncementRepository } from '../../domain/repositories/announcement.repository';
import { AnnouncementEntity } from '../../domain/entities/announcement.entity';
import {
  AnnouncementSchemaClass,
  AnnouncementDocument,
} from '../schemas/announcement.schema';

@Injectable()
export class MongoAnnouncementRepository implements AnnouncementRepository {
  constructor(
    @InjectModel(AnnouncementSchemaClass.name)
    private readonly model: Model<AnnouncementDocument>,
  ) {}

  private toEntity(doc: AnnouncementDocument): AnnouncementEntity {
    const entity = new AnnouncementEntity();
    entity.id = doc.id;
    entity.title = doc.title;
    entity.content = doc.content;
    entity.state = doc.state;
    entity.publishedAt = doc.publishedAt ?? null;
    entity.createdBy = doc.createdBy;
    entity.createdAt = (doc as any).createdAt;
    entity.updatedAt = (doc as any).updatedAt;
    return entity;
  }

  async findPaginated(
    cursor: string | null,
    limit: number,
  ): Promise<{ items: AnnouncementEntity[]; hasMore: boolean }> {
    const query: Record<string, unknown> = { state: 'published' };
    if (cursor) {
      query['_id'] = { $lt: new Types.ObjectId(cursor) };
    }
    const docs = await this.model
      .find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .exec();

    const hasMore = docs.length > limit;
    if (hasMore) docs.pop();
    return { items: docs.map((d) => this.toEntity(d)), hasMore };
  }

  async findAll(): Promise<AnnouncementEntity[]> {
    const docs = await this.model.find().sort({ _id: -1 }).exec();
    return docs.map((d) => this.toEntity(d));
  }

  async findById(id: string): Promise<AnnouncementEntity | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async countPublishedSince(since: Date | null): Promise<number> {
    const query: Record<string, unknown> = { state: 'published' };
    if (since) {
      query['publishedAt'] = { $gt: since };
    }
    return this.model.countDocuments(query).exec();
  }

  async create(entity: AnnouncementEntity): Promise<AnnouncementEntity> {
    const created = await this.model.create({
      title: entity.title,
      content: entity.content,
      state: entity.state,
      ...(entity.publishedAt && { publishedAt: entity.publishedAt }),
      createdBy: entity.createdBy,
    });
    return this.toEntity(created);
  }

  async update(entity: AnnouncementEntity): Promise<void> {
    await this.model
      .updateOne(
        { _id: entity.id },
        {
          $set: {
            title: entity.title,
            content: entity.content,
            state: entity.state,
            publishedAt: entity.publishedAt,
          },
        },
      )
      .exec();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id }).exec();
  }
}
