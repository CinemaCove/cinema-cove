import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsIn(['draft', 'published'])
  state!: 'draft' | 'published';
}
