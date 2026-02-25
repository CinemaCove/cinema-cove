import { Query } from '@nestjs/cqrs';
import { UserResponseDto } from '../dtos';

export class GetUserByIdQuery extends Query<UserResponseDto | null> {
  constructor(public id: string) {
    super();
  }
}
