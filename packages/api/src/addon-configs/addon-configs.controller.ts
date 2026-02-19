import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AddonConfigsService } from './addon-configs.service';

interface CreateAddonConfigBody {
  name: string;
  type: 'movie' | 'tv';
  languages: string[];
  sort: string;
}

interface UpdateAddonConfigBody {
  name?: string;
  type?: 'movie' | 'tv';
  languages?: string[];
  sort?: string;
}

@UseGuards(AuthGuard('jwt'))
@Controller('addon-configs')
export class AddonConfigsController {
  constructor(private readonly addonConfigsService: AddonConfigsService) {}

  @Post()
  async create(@Request() req: { user: { sub: string } }, @Body() body: CreateAddonConfigBody) {
    const doc = await this.addonConfigsService.create(req.user.sub, body);
    return { id: doc._id };
  }

  @Get()
  async list(@Request() req: { user: { sub: string } }) {
    const docs = await this.addonConfigsService.findByOwner(req.user.sub);
    return docs.map((d) => ({
      id: d._id,
      name: d.name,
      type: d.type,
      languages: d.languages,
      sort: d.sort,
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
