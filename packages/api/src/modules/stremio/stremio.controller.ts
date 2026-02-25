import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Redirect,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueryBus } from '@nestjs/cqrs';
import { StremioService } from './stremio.service';
import { DiscoverFilters } from '../shared/infrastructure/tmdb/tmdb.service';
import { AddonConfig } from './types/addon-config.interface';
import { GetAddonConfigByIdQuery } from '../addon-configs/application/queries/get-addon-config-by-id.query';
import type { AddonConfigResponseDto } from '../addon-configs/application/dtos/addon-config-response.dto';
import { GetUserByIdQuery } from '../users/application/queries/get-user-by-id.query';
import type { UserResponseDto } from '../users/application/dtos/user-response.dto';

@Controller()
export class StremioController {
  constructor(
    private readonly stremioService: StremioService,
    private readonly queryBus: QueryBus,
    private readonly configService: ConfigService,
  ) {}

  @Get('configure')
  @Redirect()
  getConfigure() {
    const configureUrl = this.configService.get<string>(
      'CONFIGURE_URL',
      'http://localhost:4200',
    );
    return { url: configureUrl, statusCode: 302 };
  }

  @Get('manifest.json')
  getLandingManifest() {
    const configureUrl = this.configService.get<string>(
      'CONFIGURE_URL',
      'http://localhost:4200',
    );
    return {
      id: 'com.cinemacove',
      version: '1.0.0',
      name: 'CinemaCove',
      description:
        'Personalised movie and TV catalogs for Stremio, powered by TMDb and Trakt. Configure your own catalogs with custom languages, filters, and sorting.',
      logo: `${configureUrl}/web-app-manifest-512x512.png`,
      resources: ['catalog'],
      types: ['movie', 'series'],
      catalogs: [],
      behaviorHints: {
        configurable: true,
        configurationURL: configureUrl,
      },
      stremioAddonsConfig: {
        issuer: 'https://stremio-addons.net',
        signature:
          'eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..mtjbsZGexCvCI8wV-vpd-w.A5i9Fbisnid-4DMiAuMPE-zgTe9sVmjVDgg0nOTyPBx8f565fP6KKdgFH1knyGT0uEMNnuzAj931aN1TjerGKyyG9Jl0Z73Jh-XNn1WeK7zb69XyEcesEKQsvhhLRbXP.yxkHHG-4aGecNoElDx-gVQ',
      },
    };
  }

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

  @Get(':configId/catalog/:type/:id.json')
  async getCatalog(
    @Param('configId') configId: string,
    @Param('type') stremioType: string,
    @Param('id') id: string,
  ) {
    const config = await this.resolveConfig(configId);
    if (config.source === 'tmdb-list') {
      const creds = config.tmdbListType
        ? await this.resolveTmdbCredentials(config.owner)
        : undefined;
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
    return this.stremioService.buildCatalog(
      config.type,
      id,
      0,
      config.sort,
      undefined,
      undefined,
      this.discoverFilters(config),
    );
  }

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
      const creds = config.tmdbListType
        ? await this.resolveTmdbCredentials(config.owner)
        : undefined;
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
    return this.stremioService.buildCatalog(
      config.type,
      id,
      skip,
      config.sort,
      genre,
      search,
      this.discoverFilters(config),
    );
  }

  private async resolveConfig(id: string): Promise<AddonConfig> {
    const doc = await this.queryBus.execute<GetAddonConfigByIdQuery, AddonConfigResponseDto | null>(
      new GetAddonConfigByIdQuery(id),
    );
    if (!doc) throw new NotFoundException('Addon config not found');
    return {
      owner: doc.owner,
      name: doc.name,
      type: doc.type,
      languages: [...doc.languages],
      sort: doc.sort as AddonConfig['sort'],
      source: doc.source,
      tmdbListId: doc.tmdbListId ?? undefined,
      tmdbListType: doc.tmdbListType ?? undefined,
      traktListId: doc.traktListId ?? undefined,
      traktListType: doc.traktListType ?? undefined,
      includeAdult: doc.includeAdult,
      minVoteAverage: doc.minVoteAverage ?? undefined,
      minVoteCount: doc.minVoteCount ?? undefined,
      releaseDateFrom: doc.releaseDateFrom ?? undefined,
      releaseDateTo: doc.releaseDateTo ?? undefined,
    };
  }

  private discoverFilters(config: AddonConfig): DiscoverFilters {
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
    const user = await this.queryBus.execute<GetUserByIdQuery, UserResponseDto | null>(
      new GetUserByIdQuery(ownerId),
    );
    if (!user?.tmdbSessionId || !user?.tmdbAccountId) return undefined;
    return { accountId: user.tmdbAccountId, sessionId: user.tmdbSessionId };
  }

  private async resolveTraktAccessToken(ownerId: string): Promise<string | undefined> {
    const user = await this.queryBus.execute<GetUserByIdQuery, UserResponseDto | null>(
      new GetUserByIdQuery(ownerId),
    );
    return user?.traktAccessToken ?? undefined;
  }
}
