import { Query } from '@nestjs/cqrs';
import { LanguageDto } from '../dtos';

export class GetLanguagesQuery extends Query<LanguageDto[]> {}
