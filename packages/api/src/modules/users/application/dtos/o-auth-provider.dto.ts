export class OAuthProviderDto {
  constructor(
    public provider: 'facebook' | 'google',
    public providerId: string,
  ) {}
}
