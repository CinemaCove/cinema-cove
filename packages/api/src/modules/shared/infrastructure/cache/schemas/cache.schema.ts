import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { SchemaTypes } from 'mongoose';

@Schema({ timestamps: true })
export class Cache {
  @Prop({ required: true, unique: true })
  public key!: string;

  @Prop({ type: SchemaTypes.Mixed, required: true })
  public value!: unknown;

  @Prop({ type: Date, index: { expireAfterSeconds: 0 } })
  public expiresAt: Date | null | undefined;
}

export type CacheDocument = HydratedDocument<Cache>;

export const CacheSchema = SchemaFactory.createForClass(Cache);
