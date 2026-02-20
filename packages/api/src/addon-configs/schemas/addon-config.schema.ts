import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AddonConfigDocument = HydratedDocument<AddonConfig>;

@Schema({ timestamps: true })
export class AddonConfig {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  owner!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, enum: ['movie', 'tv'] })
  type!: 'movie' | 'tv';

  @Prop({ type: [String], required: true })
  languages!: string[];

  @Prop({ required: true })
  sort!: string;

  @Prop({ required: true, enum: ['discover', 'tmdb-list'], default: 'discover' })
  source!: 'discover' | 'tmdb-list';

  @Prop()
  tmdbListId?: string;

  @Prop({ enum: ['watchlist', 'favorites', 'rated'] })
  tmdbListType?: 'watchlist' | 'favorites' | 'rated';
}

export const AddonConfigSchema = SchemaFactory.createForClass(AddonConfig);
