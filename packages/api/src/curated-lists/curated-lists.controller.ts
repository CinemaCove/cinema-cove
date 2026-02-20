import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { CuratedListsService } from './curated-lists.service';
import { AddonConfigsService } from '../addon-configs/addon-configs.service';

function sanitizeName(name: string): string {
  return (
    name
      .replace(/\s+/g, '-')
      .replace(/[^A-Za-z0-9_-]/g, '')
      .slice(0, 20) || 'curated'
  );
}

@Controller('curated-lists')
export class CuratedListsController {
  constructor(
    private readonly curatedListsService: CuratedListsService,
    private readonly addonConfigsService: AddonConfigsService,
  ) {}

  @Get()
  async list() {
    const docs = await this.curatedListsService.findAll();
    return docs.map((d) => ({
      id: d._id,
      tmdbListId: d.tmdbListId,
      name: d.name,
      description: d.description,
      imagePath: d.imagePath ?? null,
      icon: d.icon,
      order: d.order,
    }));
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/install')
  async install(
    @Request() req: ExpressRequest & { user: { sub: string } },
    @Param('id') id: string,
  ) {
    const curatedList = await this.curatedListsService.findById(id);
    if (!curatedList) throw new NotFoundException();

    const existing = await this.addonConfigsService.findExistingTmdbList(
      req.user.sub,
      { tmdbListId: curatedList.tmdbListId },
    );

    const doc =
      existing ??
      (await this.addonConfigsService.create(req.user.sub, {
        source: 'tmdb-list',
        tmdbListId: curatedList.tmdbListId,
        name: sanitizeName(curatedList.name),
        type: 'movie',
        languages: ['en'],
        sort: 'popularity.desc',
        includeAdult: false,
      }));

    const installUrl = `stremio://${req.get('host')}/api/${doc._id}/manifest.json`;
    return { id: doc._id, installUrl, alreadyInstalled: !!existing };
  }
}
