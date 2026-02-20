import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
class OAuthProvider {
  @Prop({ required: true })
  provider!: 'google' | 'facebook';

  @Prop({ required: true })
  providerId!: string;
}

const OAuthProviderSchema = SchemaFactory.createForClass(OAuthProvider);

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, sparse: true })
  email?: string;

  @Prop()
  passwordHash?: string;

  @Prop()
  displayName?: string;

  @Prop({ type: [OAuthProviderSchema], default: [] })
  oauthProviders!: OAuthProvider[];

  @Prop()
  tmdbSessionId?: string;

  @Prop()
  tmdbAccountId?: number;

  @Prop()
  tmdbUsername?: string;

  @Prop()
  traktAccessToken?: string;

  @Prop()
  traktRefreshToken?: string;

  @Prop()
  traktUsername?: string;

  @Prop()
  traktExpiresAt?: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
