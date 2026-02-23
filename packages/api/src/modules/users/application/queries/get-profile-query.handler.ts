import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProfileQuery } from './get-profile.query';
import { ProfileDto } from '../dtos';
import { UsersRepository } from '../../domain';

@QueryHandler(GetProfileQuery)
export class GetProfileQueryHandler implements IQueryHandler<
  GetProfileQuery,
  ProfileDto | null
> {
  constructor(private readonly usersRepository: UsersRepository) {}

  public async execute(query: GetProfileQuery): Promise<ProfileDto | null> {
    const entity = await this.usersRepository.findById(query.id);
    return !entity ? null : new ProfileDto(entity);
  }
}
