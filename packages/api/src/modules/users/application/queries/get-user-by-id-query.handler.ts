import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../domain';
import { UserResponseDto } from '../dtos';
import { GetUserByIdQuery } from './get-user-by-id.query';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler implements IQueryHandler<
  GetUserByIdQuery,
  UserResponseDto | null
> {
  constructor(private usersRepository: UsersRepository) {}

  async execute(query: GetUserByIdQuery): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.findById(query.id);

    return !user ? null : new UserResponseDto(user);
  }
}