import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DailyContentDocument = HydratedDocument<DailyContentSchemaClass>;

@Schema({ collection: 'dailycontents', timestamps: true })
export class DailyContentSchemaClass {
  @Prop({ required: true, enum: ['trivia', 'fun-fact', 'announcement'] })
  type!: 'trivia' | 'fun-fact' | 'announcement';

  @Prop({ required: true })
  title!: string;

  @Prop()
  question?: string;

  @Prop({ type: [String] })
  choices?: string[];

  @Prop()
  correctChoiceIndex?: number;

  @Prop()
  explanation?: string;

  @Prop()
  content?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ required: true })
  publishAt!: Date;

  @Prop()
  expiresAt?: Date;

  @Prop({ required: true })
  createdBy!: string;
}

export const DailyContentSchema = SchemaFactory.createForClass(DailyContentSchemaClass);
DailyContentSchema.index({ publishAt: 1 });
