import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserByEmailQuery } from './get-user-by-email.query';
import { UsersRepository } from '../../domain';
import { UserResponseDto } from '../dtos';

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailQueryHandler implements IQueryHandler<
  GetUserByEmailQuery,
  UserResponseDto | null
> {
  constructor(private usersRepository: UsersRepository) {}

  async execute(query: GetUserByEmailQuery): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.findByEmail(query.email);

    return !user ? null : new UserResponseDto(user);
  }
}