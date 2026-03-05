import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayName?: string;

  @IsOptional()
  @IsString()
  currentPassword?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/[0-9]/, {
    message: 'Password must contain at least one number',
  })
  newPassword?: string;

  @IsOptional()
  @IsBoolean()
  triviaOptOut?: boolean;

  @IsOptional()
  @IsBoolean()
  funFactOptOut?: boolean;
}