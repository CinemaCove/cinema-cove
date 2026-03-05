import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class CreateDailyContentDto {
  @IsEnum(['trivia', 'fun-fact', 'announcement'])
  type!: 'trivia' | 'fun-fact' | 'announcement';

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  choices?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  correctChoiceIndex?: number;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsDateString()
  publishAt!: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
