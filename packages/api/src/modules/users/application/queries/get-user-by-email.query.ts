import { Query } from '@nestjs/cqrs';
import { UserResponseDto } from '../dtos';

export class GetUserByEmailQuery extends Query<UserResponseDto | null> {
  constructor(public email: string) {
    super();
  }
}
