import { Query } from '@nestjs/cqrs';
import { UserResponseDto } from '../dtos';

export class GetUserByOauthQuery extends Query<UserResponseDto | null> {
  constructor(
    public readonly provider: 'facebook' | 'google',
    public readonly providerId: string,
  ) {
    super();
  }
}
