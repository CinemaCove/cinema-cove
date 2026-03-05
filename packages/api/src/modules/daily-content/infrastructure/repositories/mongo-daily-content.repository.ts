import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailyContentRepository } from '../../domain/repositories/daily-content.repository';
import { DailyContentEntity } from '../../domain/entities/daily-content.entity';
import { DailyContentSchemaClass, DailyContentDocument } from '../schemas/daily-content.schema';

@Injectable()
export class MongoDailyContentRepository implements DailyContentRepository {
  constructor(
    @InjectModel(DailyContentSchemaClass.name)
    private readonly model: Model<DailyContentDocument>,
  ) {}

  private toEntity(doc: DailyContentDocument): DailyContentEntity {
    const entity = new DailyContentEntity();
    entity.id = doc.id;
    entity.type = doc.type;
    entity.title = doc.title;
    entity.question = doc.question;
    entity.choices = doc.choices;
    entity.correctChoiceIndex = doc.correctChoiceIndex;
    entity.explanation = doc.explanation;
    entity.content = doc.content;
    entity.imageUrl = doc.imageUrl;
    entity.publishAt = doc.publishAt;
    entity.expiresAt = doc.expiresAt;
    entity.createdBy = doc.createdBy;
    return entity;
  }

  async findAll(): Promise<DailyContentEntity[]> {
    const docs = await this.model.find().sort({ publishAt: -1 }).exec();
    return docs.map((d) => this.toEntity(d));
  }

  async findById(id: string): Promise<DailyContentEntity | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findActiveForDate(date: Date, excludeIds: string[], excludeTypes: string[] = []): Promise<DailyContentEntity | null> {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const now = new Date();
    const query: Record<string, unknown> = {
      publishAt: { $gte: startOfDay, $lte: endOfDay },
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: now } }],
    };

    if (excludeIds.length > 0) {
      query['_id'] = { $nin: excludeIds };
    }

    if (excludeTypes.length > 0) {
      query['type'] = { $nin: excludeTypes };
    }

    const doc = await this.model.findOne(query).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async create(entity: DailyContentEntity): Promise<DailyContentEntity> {
    const created = await this.model.create({
      type: entity.type,
      title: entity.title,
      question: entity.question,
      choices: entity.choices,
      correctChoiceIndex: entity.correctChoiceIndex,
      explanation: entity.explanation,
      content: entity.content,
      imageUrl: entity.imageUrl,
      publishAt: entity.publishAt,
      expiresAt: entity.expiresAt,
      createdBy: entity.createdBy,
    });
    return this.toEntity(created);
  }

  async update(entity: DailyContentEntity): Promise<void> {
    await this.model
      .updateOne(
        { _id: entity.id },
        {
          $set: {
            type: entity.type,
            title: entity.title,
            question: entity.question,
            choices: entity.choices,
            correctChoiceIndex: entity.correctChoiceIndex,
            explanation: entity.explanation,
            content: entity.content,
            imageUrl: entity.imageUrl,
            publishAt: entity.publishAt,
            expiresAt: entity.expiresAt,
          },
        },
      )
      .exec();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id }).exec();
  }
}
