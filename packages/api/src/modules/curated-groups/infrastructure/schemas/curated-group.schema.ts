import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CuratedGroupDocument = HydratedDocument<CuratedGroupSchemaClass>;

@Schema({ _id: false })
class FranchiseListItemSchema {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  tmdbListId!: string;

  @Prop({ default: false })
  unified!: boolean;
}

@Schema({ collection: 'curatedgroups', timestamps: true })
export class CuratedGroupSchemaClass {
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

  @Prop({ type: [FranchiseListItemSchema], default: [] })
  lists!: FranchiseListItemSchema[];
}

export const CuratedGroupSchema = SchemaFactory.createForClass(CuratedGroupSchemaClass);
