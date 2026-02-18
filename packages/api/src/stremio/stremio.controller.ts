import { Controller, Get, Param } from '@nestjs/common';
import { StremioService } from './stremio.service';
import { AddonConfig } from './types/addon-config.interface';

@Controller()
export class StremioController {
  constructor(private readonly stremioService: StremioService) {}

  @Get(':config/manifest.json')
  getManifest(@Param('config') configBase64: string) {
    const config = this.decodeConfig(configBase64);
    return this.stremioService.buildManifest(config);
  }

  /** Catalog without extras — first page, no genre filter */
  @Get(':config/catalog/:type/:id.json')
  getCatalog(@Param('config') configBase64: string, @Param('id') id: string) {
    const { type, sort } = this.decodeConfig(configBase64);
    return this.stremioService.buildCatalog(type, id, 0, sort);
  }

  /**
   * Catalog with extras encoded as a path segment.
   * Stremio sends extras as `key=value&key=value` before `.json`,
   * e.g. `genre=Action&skip=20.json` — parsed with URLSearchParams.
   */
  @Get(':config/catalog/:type/:id/:extras.json')
  getCatalogWithExtras(
    @Param('config') configBase64: string,
    @Param('id') id: string,
    @Param('extras') extras: string,
  ) {
    const { type, sort } = this.decodeConfig(configBase64);
    const params = new URLSearchParams(extras);
    const genre = params.get('genre') ?? undefined;
    const search = params.get('search') ?? undefined;
    const skip = parseInt(params.get('skip') ?? '0', 10);
    return this.stremioService.buildCatalog(type, id, skip, sort, genre, search);
  }

  private decodeConfig(base64: string): AddonConfig {
    return JSON.parse(Buffer.from(base64, 'base64').toString()) as AddonConfig;
  }
}
