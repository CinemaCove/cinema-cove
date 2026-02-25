export class OauthLoginDto {
  public readonly provider: 'facebook' | 'google';
  public readonly providerId: string;
  public readonly email: string | null;
  public readonly displayName: string | null;

  constructor(
    provider: 'facebook' | 'google',
    providerId: string,
    email: string | null,
    displayName: string | null,
  ) {
    this.provider = provider;
    this.providerId = providerId;
    this.email = email;
    this.displayName = displayName;
  }
}
