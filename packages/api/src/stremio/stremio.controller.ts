import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { StremioService } from './stremio.service';
import { AddonConfigsService } from '../addon-configs/addon-configs.service';
import { AddonConfig } from './types/addon-config.interface';

@Controller()
export class StremioController {
  constructor(
    private readonly stremioService: StremioService,
    private readonly addonConfigsService: AddonConfigsService,
  ) {}

  @Get(':configId/manifest.json')
  async getManifest(@Param('configId') configId: string) {
    const config = await this.resolveConfig(configId);
    return this.stremioService.buildManifest(config);
  }

  /** Catalog without extras — first page, no genre filter */
  @Get(':configId/catalog/:type/:id.json')
  async getCatalog(@Param('configId') configId: string, @Param('id') id: string) {
    const { type, sort } = await this.resolveConfig(configId);
    return this.stremioService.buildCatalog(type, id, 0, sort);
  }

  /**
   * Catalog with extras encoded as a path segment.
   * Stremio sends extras as `key=value&key=value` before `.json`,
   * e.g. `genre=Action&skip=20.json` — parsed with URLSearchParams.
   */
  @Get(':configId/catalog/:type/:id/:extras.json')
  async getCatalogWithExtras(
    @Param('configId') configId: string,
    @Param('id') id: string,
    @Param('extras') extras: string,
  ) {
    const { type, sort } = await this.resolveConfig(configId);
    const params = new URLSearchParams(extras);
    const genre = params.get('genre') ?? undefined;
    const search = params.get('search') ?? undefined;
    const skip = parseInt(params.get('skip') ?? '0', 10);
    return this.stremioService.buildCatalog(type, id, skip, sort, genre, search);
  }

  private async resolveConfig(id: string): Promise<AddonConfig> {
    const doc = await this.addonConfigsService.findById(id);
    if (!doc) throw new NotFoundException('Addon config not found');
    return doc as unknown as AddonConfig;
  }
}
