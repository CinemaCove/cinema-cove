import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  public readonly email: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  public readonly displayName?: string;

  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/[0-9]/, {
    message: 'Password must contain at least one number',
  })
  public readonly password: string;

  constructor(
    email: string,
    displayName: string | undefined,
    password: string,
  ) {
    this.email = email;
    this.displayName = displayName;
    this.password = password;
  }
}