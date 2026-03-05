import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAnnouncementDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsIn(['draft', 'published'])
  state?: 'draft' | 'published';
}
