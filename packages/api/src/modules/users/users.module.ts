import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersRepository } from './domain';
import { MongoUsersRepository, User, UserSchema } from './infrastructure';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AddOAuthProviderCommandHandler,
  GetProfileQueryHandler,
  GetUserByEmailQueryHandler,
  GetUserByOauthQueryHandler,
  RegisterUserCommandHandler,
  RegisterUserWithOAuthCommand,
  UpdateProfileCommandHandler,
} from './application';
import { PasswordHasherModule } from '../shared/infrastructure/password-hasher/password-hasher.module';

const HANDLERS = [
  AddOAuthProviderCommandHandler,
  RegisterUserCommandHandler,
  RegisterUserWithOAuthCommand,
  UpdateProfileCommandHandler,
  GetProfileQueryHandler,
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
