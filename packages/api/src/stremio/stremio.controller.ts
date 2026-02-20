import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { StremioService } from './stremio.service';
import { AddonConfigsService } from '../addon-configs/addon-configs.service';
import { UsersService } from '../users/users.service';
import { AddonConfig } from './types/addon-config.interface';

@Controller()
export class StremioController {
  constructor(
    private readonly stremioService: StremioService,
    private readonly addonConfigsService: AddonConfigsService,
    private readonly usersService: UsersService,
  ) {}

  @Get(':configId/manifest.json')
  async getManifest(@Param('configId') configId: string) {
    const config = await this.resolveConfig(configId);
    if (config.source === 'tmdb-list') {
      return this.stremioService.buildTmdbListManifest(config);
    }
    if (config.source === 'trakt-list') {
      return this.stremioService.buildTraktListManifest(config);
    }
    return this.stremioService.buildManifest(config);
  }

  /** Catalog without extras — first page */
  @Get(':configId/catalog/:type/:id.json')
  async getCatalog(
    @Param('configId') configId: string,
    @Param('type') stremioType: string,
    @Param('id') id: string,
  ) {
    const config = await this.resolveConfig(configId);
    if (config.source === 'tmdb-list') {
      const creds = config.tmdbListType ? await this.resolveTmdbCredentials(config.owner) : undefined;
      return this.stremioService.buildTmdbListCatalog(
        config,
        stremioType === 'movie' ? 'movie' : 'series',
        0,
        creds,
      );
    }
    if (config.source === 'trakt-list') {
      const token = await this.resolveTraktAccessToken(config.owner);
      if (!token) return { metas: [] };
      return this.stremioService.buildTraktListCatalog(
        config,
        stremioType === 'movie' ? 'movie' : 'series',
        0,
        token,
      );
    }
    return this.stremioService.buildCatalog(config.type, id, 0, config.sort, undefined, undefined, this.discoverFilters(config));
  }

  /**
   * Catalog with extras encoded as a path segment.
   * Stremio sends extras as `key=value&key=value` before `.json`,
   * e.g. `genre=Action&skip=20.json` — parsed with URLSearchParams.
   */
  @Get(':configId/catalog/:type/:id/:extras.json')
  async getCatalogWithExtras(
    @Param('configId') configId: string,
    @Param('type') stremioType: string,
    @Param('id') id: string,
    @Param('extras') extras: string,
  ) {
    const config = await this.resolveConfig(configId);
    const params = new URLSearchParams(extras);
    const skip = parseInt(params.get('skip') ?? '0', 10);

    if (config.source === 'tmdb-list') {
      const creds = config.tmdbListType ? await this.resolveTmdbCredentials(config.owner) : undefined;
      return this.stremioService.buildTmdbListCatalog(
        config,
        stremioType === 'movie' ? 'movie' : 'series',
        skip,
        creds,
      );
    }
    if (config.source === 'trakt-list') {
      const token = await this.resolveTraktAccessToken(config.owner);
      if (!token) return { metas: [] };
      return this.stremioService.buildTraktListCatalog(
        config,
        stremioType === 'movie' ? 'movie' : 'series',
        skip,
        token,
      );
    }

    const genre = params.get('genre') ?? undefined;
    const search = params.get('search') ?? undefined;
    return this.stremioService.buildCatalog(config.type, id, skip, config.sort, genre, search, this.discoverFilters(config));
  }

  private async resolveConfig(id: string): Promise<AddonConfig> {
    const doc = await this.addonConfigsService.findById(id);
    if (!doc) throw new NotFoundException('Addon config not found');
    return {
      owner: doc.owner.toString(),
      name: doc.name,
      type: doc.type,
      languages: doc.languages,
      sort: doc.sort as AddonConfig['sort'],
      source: (doc.source ?? 'discover') as AddonConfig['source'],
      tmdbListId: doc.tmdbListId,
      tmdbListType: doc.tmdbListType,
      traktListId: doc.traktListId,
      traktListType: doc.traktListType,
      includeAdult: doc.includeAdult,
      minVoteAverage: doc.minVoteAverage,
      minVoteCount: doc.minVoteCount,
      releaseDateFrom: doc.releaseDateFrom,
      releaseDateTo: doc.releaseDateTo,
    };
  }

  private discoverFilters(config: AddonConfig): import('../tmdb/tmdb.service').DiscoverFilters {
    return {
      includeAdult: config.includeAdult,
      minVoteAverage: config.minVoteAverage,
      minVoteCount: config.minVoteCount,
      releaseDateFrom: config.releaseDateFrom,
      releaseDateTo: config.releaseDateTo,
    };
  }

  private async resolveTmdbCredentials(
    ownerId: string,
  ): Promise<{ accountId: number; sessionId: string } | undefined> {
    const user = await this.usersService.findById(ownerId);
    if (!user?.tmdbSessionId || !user?.tmdbAccountId) return undefined;
    return { accountId: user.tmdbAccountId!, sessionId: user.tmdbSessionId! };
  }

  private async resolveTraktAccessToken(ownerId: string): Promise<string | undefined> {
    const user = await this.usersService.findById(ownerId);
    return user?.traktAccessToken ?? undefined;
  }
}
