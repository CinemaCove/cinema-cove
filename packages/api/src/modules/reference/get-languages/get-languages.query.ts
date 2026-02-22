import { Query } from '@nestjs/cqrs';
import { LanguageDto } from './language.dto';

export class GetLanguagesQuery extends Query<LanguageDto[]> {}
