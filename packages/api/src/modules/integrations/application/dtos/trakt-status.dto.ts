export class TraktStatusDto {
  constructor(
    public readonly connected: boolean,
    public readonly username: string | null,
  ) {}
}
