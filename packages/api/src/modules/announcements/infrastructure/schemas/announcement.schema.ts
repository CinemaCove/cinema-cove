import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AnnouncementDocument = HydratedDocument<AnnouncementSchemaClass>;

@Schema({ collection: 'announcements', timestamps: true })
export class AnnouncementSchemaClass {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true, default: '' })
  content!: string;

  @Prop({ required: true, enum: ['draft', 'published'], default: 'draft' })
  state!: 'draft' | 'published';

  @Prop()
  publishedAt?: Date;

  @Prop({ required: true })
  createdBy!: string;
}

export const AnnouncementSchema = SchemaFactory.createForClass(AnnouncementSchemaClass);
AnnouncementSchema.index({ state: 1, publishedAt: -1 });
