import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TraktClient } from '@cinemacove/trakt-client';

@Injectable()
export class TraktService {
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(configService: ConfigService) {
    this.clientId = configService.getOrThrow<string>('TRAKT_CLIENT_ID');
    this.clientSecret = configService.getOrThrow<string>('TRAKT_CLIENT_SECRET');
  }

  getAuthUrl(callbackUrl: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: callbackUrl,
    });
    return `https://trakt.tv/oauth/authorize?${params}`;
  }

  async exchangeCode(code: string, redirectUri: string) {
    const client = new TraktClient({ clientId: this.clientId });
    return client.authentication.getToken({
      code,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      redirectUri,
    });
  }

  private clientFor(accessToken: string): TraktClient {
    return new TraktClient({ clientId: this.clientId, accessToken });
  }

  async getProfile(accessToken: string) {
    const client = this.clientFor(accessToken);
    return client.users.getProfile('me');
  }

  async getWatchlist(accessToken: string, type: 'movies' | 'shows', page = 1, limit = 20) {
    const client = this.clientFor(accessToken);
    return client.sync.getWatchlist(type, undefined, undefined, { page, limit });
  }

  async getFavorites(accessToken: string, type: 'movies' | 'shows', page = 1, limit = 20) {
    const client = this.clientFor(accessToken);
    return client.sync.getFavorites(type, undefined, undefined, { page, limit });
  }

  async getRatings(accessToken: string, type: 'movies' | 'shows', page = 1, limit = 20) {
    const client = this.clientFor(accessToken);
    return client.sync.getRatings(type, undefined, { page, limit });
  }

  async getUserLists(accessToken: string) {
    const client = this.clientFor(accessToken);
    return client.users.getLists('me');
  }

  async getUserListItems(
    accessToken: string,
    listId: string,
    type: 'movie' | 'show',
    page = 1,
    limit = 20,
  ) {
    const client = this.clientFor(accessToken);
    return client.users.getListItems('me', listId, type, undefined, undefined, { page, limit });
  }
}