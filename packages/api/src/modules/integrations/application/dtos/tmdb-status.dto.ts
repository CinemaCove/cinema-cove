export class TmdbStatusDto {
  constructor(
    public readonly connected: boolean,
    public readonly accountId: number | null,
    public readonly username: string | null,
  ) {}
}
