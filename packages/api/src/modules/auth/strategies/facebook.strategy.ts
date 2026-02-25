import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { AuthService } from '../services';
import { OauthLoginDto } from '../dtos';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('FACEBOOK_APP_ID'),
      clientSecret: configService.getOrThrow<string>('FACEBOOK_APP_SECRET'),
      callbackURL: '/api/auth/facebook/callback',
      scope: ['email'],
      profileFields: ['id', 'emails', 'displayName'],
      proxy: true,
    });
  }

  public async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    const email = profile.emails?.[0]?.value || null;
    const displayName = profile.displayName;
    return this.authService.loginOrCreateOAuthUser(
      new OauthLoginDto('facebook', profile.id, email, displayName),
    );
  }
}
