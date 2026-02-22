import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post, Req, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AddonConfigsService } from './addon-configs.service';
import { UsersService } from '../users/users.service';

interface DiscoverFilterBody {
  includeAdult?: boolean;
  minVoteAverage?: number | null;
  minVoteCount?: number | null;
  releaseDateFrom?: number | null;
  releaseDateTo?: number | null;
}

interface CreateAddonConfigBody extends DiscoverFilterBody {
  name: string;
  type: 'movie' | 'tv';
  languages: string[];
  sort: string;
}

interface UpdateAddonConfigBody extends DiscoverFilterBody {
  name?: string;
  type?: 'movie' | 'tv';
  languages?: string[];
  sort?: string;
}

@UseGuards(AuthGuard('jwt'))
@Controller('addon-configs')
export class AddonConfigsController {
  constructor(
    private readonly addonConfigsService: AddonConfigsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async create(@Request() req: { user: { sub: string } }, @Body() body: CreateAddonConfigBody) {
    const user = await this.usersService.findById(req.user.sub);
    if (!user) throw new UnauthorizedException();
    const doc = await this.addonConfigsService.create(req.user.sub, body, user.maxAllowedConfigs ?? 20);
    return { id: doc._id };
  }

  @Get()
  async list(@Req() req: ExpressRequest & { user: { sub: string } }) {
    const docs = await this.addonConfigsService.findByOwner(req.user.sub);
    return docs.map((d) => ({
      id: d._id,
      name: d.name,
      type: d.type,
      source: d.source,
      tmdbListType: d.tmdbListType ?? null,
      traktListType: d.traktListType ?? null,
      languages: d.languages,
      sort: d.sort,
      includeAdult: d.includeAdult ?? false,
      minVoteAverage: d.minVoteAverage ?? null,
      minVoteCount: d.minVoteCount ?? null,
      releaseDateFrom: d.releaseDateFrom ?? null,
      releaseDateTo: d.releaseDateTo ?? null,
      installUrl: `stremio://${req.get('host')}/api/${d._id}/manifest.json`,
    }));
  }

  @Patch(':id')
  async update(
    @Request() req: { user: { sub: string } },
    @Param('id') id: string,
    @Body() body: UpdateAddonConfigBody,
  ) {
    const doc = await this.addonConfigsService.updateByOwner(id, req.user.sub, body);
    if (!doc) throw new NotFoundException();
    return { id: doc._id };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req: { user: { sub: string } }, @Param('id') id: string) {
    const doc = await this.addonConfigsService.deleteByOwner(id, req.user.sub);
    if (!doc) throw new NotFoundException();
  }
}
