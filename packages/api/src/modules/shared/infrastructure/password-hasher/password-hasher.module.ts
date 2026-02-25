import { Global, Module } from '@nestjs/common';
import { PasswordHasher } from '../../domain/services/password-hasher';
import { ArgonPasswordHasher } from './argon-password-hasher';

@Global()
@Module({
  providers: [{ provide: PasswordHasher, useClass: ArgonPasswordHasher }],
  exports: [PasswordHasher],
})
export class PasswordHasherModule {}
