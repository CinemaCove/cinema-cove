import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CuratedListDocument = HydratedDocument<CuratedListSchemaClass>;

@Schema({ collection: 'curatedlists', timestamps: true })
export class CuratedListSchemaClass {
  @Prop({ required: true })
  tmdbListId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  description!: string;

  @Prop()
  imagePath?: string;

  @Prop({ required: true })
  icon!: string;

  @Prop({ default: 0 })
  order!: number;

  @Prop({ default: false })
  unified!: boolean;
}

export const CuratedListSchema = SchemaFactory.createForClass(CuratedListSchemaClass);
