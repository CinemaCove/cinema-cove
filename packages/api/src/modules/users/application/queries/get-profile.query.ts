import { Query } from '@nestjs/cqrs';
import { ProfileDto } from '../dtos';

export class GetProfileQuery extends Query<ProfileDto | null> {
  public constructor(public readonly id: string) {
    super();
  }
}
