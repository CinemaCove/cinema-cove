import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserByOauthQuery } from './get-user-by-oauth.query';
import { UserResponseDto } from '../dtos';
import { UsersRepository } from '../../domain';

@QueryHandler(GetUserByOauthQuery)
export class GetUserByOauthQueryHandler implements IQueryHandler<
  GetUserByOauthQuery,
  UserResponseDto | null
> {
  constructor(private usersRepository: UsersRepository) {}

  async execute(query: GetUserByOauthQuery): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.findByOAuth(
      query.provider,
      query.providerId,
    );

    return !user ? null : new UserResponseDto(user);
  }
}
