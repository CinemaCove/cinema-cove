import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CuratedListDocument = HydratedDocument<CuratedList>;

@Schema({ timestamps: true })
export class CuratedList {
  @Prop({ required: true })
  tmdbListId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  description!: string;

  /** Optional path to a cover image (served statically or via CDN). */
  @Prop()
  imagePath?: string;

  /** Material icon name shown as fallback / dashboard preview. */
  @Prop({ required: true })
  icon!: string;

  /** Controls display order (ascending). */
  @Prop({ default: 0 })
  order!: number;
}

export const CuratedListSchema = SchemaFactory.createForClass(CuratedList);
