import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetLanguagesQuery } from './get-languages';
import { GetSortOptionsQuery } from './get-sort-options';

@Controller('reference')
export class ReferenceController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('languages')
  async getLanguages() {
    return await this.queryBus.execute(new GetLanguagesQuery());
  }

  @Get('sort-options')
  async getSortOptions() {
    return await this.queryBus.execute(new GetSortOptionsQuery());
  }
}
