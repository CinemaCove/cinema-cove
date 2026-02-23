import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  public readonly email: string;

  @IsString()
  public readonly password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}