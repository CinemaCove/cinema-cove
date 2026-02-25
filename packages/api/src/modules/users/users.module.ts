import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersRepository } from './domain';
import { MongoUsersRepository, User, UserSchema } from './infrastructure';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AddOAuthProviderCommandHandler,
  ClearTmdbSessionCommandHandler,
  ClearTraktTokensCommandHandler,
  GetProfileQueryHandler,
  GetUserByEmailQueryHandler,
  GetUserByIdQueryHandler,
  GetUserByOauthQueryHandler,
  RegisterUserCommandHandler,
  RegisterUserWithOAuthCommand,
  SaveTmdbSessionCommandHandler,
  SaveTraktTokensCommandHandler,
  UpdateProfileCommandHandler,
} from './application';
import { PasswordHasherModule } from '../shared/infrastructure/password-hasher/password-hasher.module';

const HANDLERS = [
  AddOAuthProviderCommandHandler,
  RegisterUserCommandHandler,
  RegisterUserWithOAuthCommand,
  UpdateProfileCommandHandler,
  SaveTmdbSessionCommandHandler,
  ClearTmdbSessionCommandHandler,
  SaveTraktTokensCommandHandler,
  ClearTraktTokensCommandHandler,
  GetProfileQueryHandler,
  GetUserByIdQueryHandler,
  GetUserByEmailQueryHandler,
  GetUserByOauthQueryHandler,
];
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PasswordHasherModule,
  ],
  controllers: [UsersController],
  providers: [
    ...HANDLERS,
    { provide: UsersRepository, useClass: MongoUsersRepository },
  ],
})
export class UsersModule {}
