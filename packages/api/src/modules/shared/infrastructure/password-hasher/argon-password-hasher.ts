import * as argon2 from 'argon2';
import { Injectable } from '@nestjs/common';
import { PasswordHasher } from '../../domain/services/password-hasher';

@Injectable()
export class ArgonPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async verify(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }
}
