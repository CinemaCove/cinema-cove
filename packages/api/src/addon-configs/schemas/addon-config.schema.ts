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

  @Prop({ required: true, enum: ['discover', 'tmdb-list', 'trakt-list'], default: 'discover' })
  source!: 'discover' | 'tmdb-list' | 'trakt-list';

  @Prop()
  tmdbListId?: string;

  @Prop({ enum: ['watchlist', 'favorites', 'rated'] })
  tmdbListType?: 'watchlist' | 'favorites' | 'rated';

  @Prop()
  traktListId?: string;

  @Prop({ enum: ['watchlist', 'favorites', 'rated'] })
  traktListType?: 'watchlist' | 'favorites' | 'rated';

  @Prop()
  imagePath?: string;

  // ── Discover filters ───────────────────────────────────────────────────────

  @Prop({ default: false })
  includeAdult!: boolean;

  @Prop({ min: 0, max: 10 })
  minVoteAverage?: number;

  @Prop({ min: 0 })
  minVoteCount?: number;

  @Prop({ min: 1888 })
  releaseDateFrom?: number;

  @Prop({ min: 1888 })
  releaseDateTo?: number;
}

export const AddonConfigSchema = SchemaFactory.createForClass(AddonConfig);
