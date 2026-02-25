export class OauthProviderEntity {
  constructor(
    public provider: 'facebook' | 'google',
    public providerId: string,
  ) {}
}
