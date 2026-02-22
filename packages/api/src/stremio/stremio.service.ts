import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DiscoverMovieResultItem,
  DiscoverTvShowResultItem,
} from '@cinemacove/tmdb-client/v3';
import { DiscoverFilters, SortBy, TmdbService } from '../tmdb/tmdb.service';
import { TraktService } from '../trakt/trakt.service';
import { AddonConfig } from './types/addon-config.interface';

import pLimit from 'p-limit';

interface StremioMeta {
  id: string;
  type: string;
  name: string;
  poster?: string;
  description: string;
  imdbId?: string;
  genres: string[];
  releaseInfo?: string;
  director: string[];
  cast: string[];
  imdbRating?: string;
  trailers?: { source: string; type: string }[];
  runtime?: string;
  language?: string;
  country?: string;
}

@Injectable()
export class StremioService {
  constructor(
    private readonly tmdbService: TmdbService,
    private readonly traktService: TraktService,
    private readonly configService: ConfigService,
  ) {}

  // ── Discover (existing) ────────────────────────────────────────────────────

  async buildManifest(config: AddonConfig): Promise<object> {
    const languages = await this.tmdbService.getLanguages();
    const genres =
      config.type === 'movie'
        ? await this.tmdbService.getMovieGenres()
        : await this.tmdbService.getTvShowGenres();

    const langMap = new Map(
      languages.map((l) => [l.iso639_1, l.englishName || l.name]),
    );

    const nameSlug = config.name.toLowerCase().replace(/\s+/g, '-');
    const catalogType = `CC-${config.name}`;
    const genreOptions = genres.map((g) => g.name);

    const extra = [
      { name: 'search', isRequired: false },
      { name: 'genre', isRequired: false, options: genreOptions },
      { name: 'skip', isRequired: false },
    ];

    const catalogs = config.languages.length > 0
      ? config.languages.map((lang) => ({
          type: catalogType,
          id: `cinemacove-${nameSlug}-${lang}`,
          name: langMap.get(lang) ?? lang,
          extra,
        }))
      : [{ type: catalogType, id: `cinemacove-${nameSlug}-all`, name: config.name, extra }];

    const configureUrl = this.configService.get<string>(
      'CONFIGURE_URL',
      'http://localhost:4200',
    );

    return {
      id: `com.cinemacove.${nameSlug}`,
      version: '1.0.0',
      name: `CinemaCove-${config.name}`,
      resources: ['catalog'],
      types: [catalogType],
      catalogs,
    };
  }

  async buildCatalog(
    type: 'movie' | 'tv',
    catalogId: string,
    skip: number,
    sort: SortBy = 'popularity.desc',
    genreName?: string,
    search?: string,
    filters: DiscoverFilters = {},
  ): Promise<object> {
    const rawLang = catalogId.split('-').pop()!;
    const lang = rawLang === 'all' ? undefined : rawLang;
    const page = Math.floor(skip / 20) + 1;

    const genreId = genreName
      ? type === 'movie'
        ? await this.tmdbService.resolveMovieGenreIds(genreName)
        : await this.tmdbService.resolveTvShowGenreIds(genreName)
      : undefined;

    const results: (DiscoverMovieResultItem | DiscoverTvShowResultItem)[] =
      type === 'movie'
        ? (await this.tmdbService.discoverMovies(lang, page, sort, genreId, search, filters)).results
        : (await this.tmdbService.discoverTvShows(lang, page, sort, genreId, search, filters)).results;

    const limit = pLimit(5);

    const metas: StremioMeta[] = await Promise.all(
      results.map(async (item) =>
        limit(async () => {
          const stremioType = type === 'movie' ? 'movie' : 'series';

          switch (type) {
            case 'movie': {
              const details = await this.tmdbService.getMovieDetails(item.id);
              const directors = [...details.credits!.crew]
                .filter((c) => c.job === 'Director')
                .map((c) => c.name);
              const topActors = [...details.credits!.cast]
                .sort((a, b) => a.order - b.order) // already sorted usually, but safe
                .slice(0, 5)
                .map((actor) => actor.name);

              const meta: StremioMeta = {
                id: `${details.imdbId || 'tmdb:' + details.id}`,
                type: stremioType,
                name: details.originalTitle,
                poster: item.posterPath
                  ? `https://image.tmdb.org/t/p/w500${details.posterPath}`
                  : undefined,
                description: details.overview,
                imdbId: details.imdbId,
                genres: details.genres.map((g) => g.name),
                releaseInfo: details.releaseDate?.slice(0, 4),
                director: directors,
                cast: topActors,
                imdbRating: details.voteAverage.toFixed(1),
                trailers: (details.videos?.results ?? [])
                  .filter((v) => v.site == 'YouTube' && v.type === 'Trailer')
                  .map((v) => {
                    return {
                      source: v.key,
                      type: 'Trailer',
                    };
                  }),
                runtime: details.runtime
                  ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
                      .replace(/0h /, '')
                      .replace(/ 0m$/, 'h')
                  : 'N/A',
                language: details.originalLanguage,
                country: details.productionCountries
                  .map((c) => c.name)
                  .join(', '),
              };

              return meta;
            }
            case 'tv': {
              const details = await this.tmdbService.getTvShowDetails(item.id);

              const directors = [...details.credits!.crew]
                .filter((c) => c.job === 'Director')
                .map((c) => c.name);
              const topActors = [...details.credits!.cast]
                .sort((a, b) => a.order - b.order) // already sorted usually, but safe
                .slice(0, 5)
                .map((actor) => actor.name);

              const meta: StremioMeta = {
                id: `${details.externalIds || 'tmdb:' + details.id}`,
                type: stremioType,
                name: details.name,
                poster: item.posterPath
                  ? `https://image.tmdb.org/t/p/w500${details.posterPath}`
                  : undefined,
                description: details.overview,
                imdbId: details.externalIds!.imdbId,
                genres: details.genres.map((g) => g.name),
                releaseInfo: `${details.firstAirDate?.slice(0, 4)}-${details.lastAirDate?.slice(0, 4)}`,
                director: directors,
                cast: topActors,
                imdbRating: details.voteAverage.toFixed(1),
                trailers: (details.videos?.results ?? [])
                  .filter((v) => v.site == 'YouTube' && v.type === 'Trailer')
                  .map((v) => {
                    return {
                      source: v.key,
                      type: 'Trailer',
                    };
                  }),
                runtime: details.episodeRunTime[0]
                  ? `${Math.floor(details.episodeRunTime[0] / 60)}h ${details.episodeRunTime[0] % 60}m`
                      .replace(/0h /, '')
                      .replace(/ 0m$/, 'h')
                  : 'N/A',
                language: details.originalLanguage,
                country: details.productionCountries
                  .map((c) => c.name)
                  .join(', '),
              };

              return meta;
            }
            default: {
              throw new Error('type not implemented');
            }
          }
        }),
      ),
    );

    return { metas };
  }

  // ── TMDB Custom Lists ──────────────────────────────────────────────────────

  /** Max chars for addon/catalog name shown in Stremio sidebar. */
  private truncate(name: string, max = 20): string {
    return name.length > max ? name.slice(0, max - 1) + '…' : name;
  }

  async buildTmdbListManifest(config: AddonConfig): Promise<object> {
    const shortName = this.truncate(config.name);
    const configureUrl = this.configService.get<string>('CONFIGURE_URL', 'http://localhost:4200');
    const addonId = config.tmdbListId
      ? `com.cinemacove.list.${config.owner}.${config.tmdbListId}`
      : `com.cinemacove.builtin.${config.owner}.${config.tmdbListType}.${config.type}`;

    // Built-in lists (watchlist/favorites/rated) are single-type.
    // Custom lists are mixed → expose both catalog types so Stremio can request either.
    const isBuiltin = !!config.tmdbListType;
    const catalogType = isBuiltin
      ? config.type === 'movie' ? 'movie' : 'series'
      : undefined;

    const catalogs = isBuiltin
      ? [
          {
            type: catalogType!,
            id: `cinemacove-builtin-${config.tmdbListType}-${config.type}`,
            name: `CC-${shortName}`,
            extra: [{ name: 'skip', isRequired: false }],
          },
        ]
      : [
          {
            type: 'movie',
            id: `cinemacove-list-${config.tmdbListId}-movie`,
            name: `CC-${shortName}`,
            extra: [{ name: 'skip', isRequired: false }],
          },
          {
            type: 'series',
            id: `cinemacove-list-${config.tmdbListId}-series`,
            name: `CC-${shortName}`,
            extra: [{ name: 'skip', isRequired: false }],
          },
        ];

    return {
      id: addonId,
      version: '1.0.0',
      name: `CinemaCove – ${shortName}`,
      resources: ['catalog'],
      types: isBuiltin ? [catalogType!] : ['movie', 'series'],
      catalogs
    };
  }

  /**
   * @param stremioType  - 'movie' or 'series', from the Stremio catalog URL
   * @param creds        - required only for built-in lists (watchlist/favorites/rated)
   */
  async buildTmdbListCatalog(
    config: AddonConfig,
    stremioType: 'movie' | 'series',
    skip: number,
    creds?: { accountId: number; sessionId: string },
  ): Promise<object> {
    const page = Math.floor(skip / 20) + 1;
    const tmdbMediaType = stremioType === 'movie' ? 'movie' : 'tv';

    let items: any[];

    if (config.tmdbListType) {
      // Built-in list — needs user credentials
      if (!creds) return { metas: [] };
      const data = await this.tmdbService.getTmdbUserList(
        config.tmdbListType,
        config.type, // 'movie' | 'tv' — already type-specific
        creds.accountId,
        creds.sessionId,
        page,
      );
      // Only return items when the requested Stremio type matches the list's content type
      if (tmdbMediaType !== config.type) return { metas: [] };
      items = data.results ?? [];
    } else {
      // Custom list — public endpoint, no credentials needed
      const data = await this.tmdbService.getCustomListItems(config.tmdbListId!, page);
      items = (data.items ?? []).filter((item: any) => item.media_type === tmdbMediaType);
    }

    const limit = pLimit(5);
    const metas: StremioMeta[] = await Promise.all(
      items.map((item) =>
        limit(async () => {
          if (tmdbMediaType === 'movie') {
            const details = await this.tmdbService.getMovieDetails(item.id);
            const directors = [...details.credits!.crew]
              .filter((c) => c.job === 'Director')
              .map((c) => c.name);
            const topActors = [...details.credits!.cast]
              .sort((a, b) => a.order - b.order)
              .slice(0, 5)
              .map((a) => a.name);

            return {
              id: details.imdbId || `tmdb:${details.id}`,
              type: 'movie',
              name: details.originalTitle,
              poster: item.poster_path
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                : undefined,
              description: details.overview,
              imdbId: details.imdbId,
              genres: details.genres.map((g) => g.name),
              releaseInfo: details.releaseDate?.slice(0, 4),
              director: directors,
              cast: topActors,
              imdbRating: details.voteAverage.toFixed(1),
              trailers: (details.videos?.results ?? [])
                .filter((v) => v.site === 'YouTube' && v.type === 'Trailer')
                .map((v) => ({ source: v.key, type: 'Trailer' })),
              runtime: details.runtime
                ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
                    .replace(/0h /, '')
                    .replace(/ 0m$/, 'h')
                : 'N/A',
              language: details.originalLanguage,
              country: details.productionCountries.map((c) => c.name).join(', '),
            } as StremioMeta;
          } else {
            const details = await this.tmdbService.getTvShowDetails(item.id);
            const directors = [...details.credits!.crew]
              .filter((c) => c.job === 'Director')
              .map((c) => c.name);
            const topActors = [...details.credits!.cast]
              .sort((a, b) => a.order - b.order)
              .slice(0, 5)
              .map((a) => a.name);

            return {
              id: details.externalIds?.imdbId || `tmdb:${details.id}`,
              type: 'series',
              name: details.name,
              poster: item.poster_path
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                : undefined,
              description: details.overview,
              imdbId: details.externalIds?.imdbId,
              genres: details.genres.map((g) => g.name),
              releaseInfo: `${details.firstAirDate?.slice(0, 4)}-${details.lastAirDate?.slice(0, 4)}`,
              director: directors,
              cast: topActors,
              imdbRating: details.voteAverage.toFixed(1),
              trailers: (details.videos?.results ?? [])
                .filter((v) => v.site === 'YouTube' && v.type === 'Trailer')
                .map((v) => ({ source: v.key, type: 'Trailer' })),
              runtime: details.episodeRunTime[0]
                ? `${Math.floor(details.episodeRunTime[0] / 60)}h ${details.episodeRunTime[0] % 60}m`
                    .replace(/0h /, '')
                    .replace(/ 0m$/, 'h')
                : 'N/A',
              language: details.originalLanguage,
              country: details.productionCountries.map((c) => c.name).join(', '),
            } as StremioMeta;
          }
        }),
      ),
    );

    return { metas };
  }

  // ── Trakt Lists ────────────────────────────────────────────────────────────

  async buildTraktListManifest(config: AddonConfig): Promise<object> {
    const shortName = this.truncate(config.name);
    const configureUrl = this.configService.get<string>('CONFIGURE_URL', 'http://localhost:4200');
    const addonId = config.traktListId
      ? `com.cinemacove.trakt.list.${config.owner}.${config.traktListId}`
      : `com.cinemacove.trakt.builtin.${config.owner}.${config.traktListType}.${config.type}`;

    const isBuiltin = !!config.traktListType;
    const catalogType = isBuiltin
      ? config.type === 'movie' ? 'movie' : 'series'
      : undefined;

    const catalogs = isBuiltin
      ? [
          {
            type: catalogType!,
            id: `cinemacove-trakt-builtin-${config.traktListType}-${config.type}`,
            name: shortName,
            extra: [{ name: 'skip', isRequired: false }],
          },
        ]
      : [
          {
            type: 'movie',
            id: `cinemacove-trakt-list-${config.traktListId}-movie`,
            name: shortName,
            extra: [{ name: 'skip', isRequired: false }],
          },
          {
            type: 'series',
            id: `cinemacove-trakt-list-${config.traktListId}-series`,
            name: shortName,
            extra: [{ name: 'skip', isRequired: false }],
          },
        ];

    return {
      id: addonId,
      version: '1.0.0',
      name: `CinemaCove – ${shortName}`,
      resources: ['catalog'],
      types: isBuiltin ? [catalogType!] : ['movie', 'series'],
      catalogs,
    };
  }

  /**
   * @param stremioType   - 'movie' or 'series', from the Stremio catalog URL
   * @param accessToken   - Trakt access token for the catalog owner
   */
  async buildTraktListCatalog(
    config: AddonConfig,
    stremioType: 'movie' | 'series',
    skip: number,
    accessToken: string,
  ): Promise<object> {
    const page = Math.floor(skip / 20) + 1;
    const tmdbMediaType = stremioType === 'movie' ? 'movie' : 'tv';
    const traktType = stremioType === 'movie' ? 'movies' : 'shows';

    let tmdbIds: number[];

    if (config.traktListType) {
      // Built-in list — only matches the catalog's own type
      if (tmdbMediaType !== config.type) return { metas: [] };
      const items =
        config.traktListType === 'watchlist'
          ? await this.traktService.getWatchlist(accessToken, traktType, page)
          : config.traktListType === 'favorites'
            ? await this.traktService.getFavorites(accessToken, traktType, page)
            : await this.traktService.getRatings(accessToken, traktType, page);

      tmdbIds = (items as any[])
        .map((item) => (tmdbMediaType === 'movie' ? item.movie?.ids?.tmdb : item.show?.ids?.tmdb))
        .filter((id): id is number => !!id);
    } else {
      // Custom list — filter by requested type
      const items = await this.traktService.getUserListItems(
        accessToken,
        config.traktListId!,
        stremioType === 'movie' ? 'movie' : 'show',
        page,
      );
      tmdbIds = (items as any[])
        .map((item) => (tmdbMediaType === 'movie' ? item.movie?.ids?.tmdb : item.show?.ids?.tmdb))
        .filter((id): id is number => !!id);
    }

    const limit = pLimit(5);
    const metas: StremioMeta[] = await Promise.all(
      tmdbIds.map((tmdbId) =>
        limit(async () => {
          if (tmdbMediaType === 'movie') {
            const details = await this.tmdbService.getMovieDetails(tmdbId);
            const directors = [...details.credits!.crew]
              .filter((c) => c.job === 'Director')
              .map((c) => c.name);
            const topActors = [...details.credits!.cast]
              .sort((a, b) => a.order - b.order)
              .slice(0, 5)
              .map((a) => a.name);

            return {
              id: details.imdbId || `tmdb:${details.id}`,
              type: 'movie',
              name: details.originalTitle,
              poster: details.posterPath
                ? `https://image.tmdb.org/t/p/w500${details.posterPath}`
                : undefined,
              description: details.overview,
              imdbId: details.imdbId,
              genres: details.genres.map((g) => g.name),
              releaseInfo: details.releaseDate?.slice(0, 4),
              director: directors,
              cast: topActors,
              imdbRating: details.voteAverage.toFixed(1),
              trailers: (details.videos?.results ?? [])
                .filter((v) => v.site === 'YouTube' && v.type === 'Trailer')
                .map((v) => ({ source: v.key, type: 'Trailer' })),
              runtime: details.runtime
                ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
                    .replace(/0h /, '')
                    .replace(/ 0m$/, 'h')
                : 'N/A',
              language: details.originalLanguage,
              country: details.productionCountries.map((c) => c.name).join(', '),
            } as StremioMeta;
          } else {
            const details = await this.tmdbService.getTvShowDetails(tmdbId);
            const directors = [...details.credits!.crew]
              .filter((c) => c.job === 'Director')
              .map((c) => c.name);
            const topActors = [...details.credits!.cast]
              .sort((a, b) => a.order - b.order)
              .slice(0, 5)
              .map((a) => a.name);

            return {
              id: details.externalIds?.imdbId || `tmdb:${details.id}`,
              type: 'series',
              name: details.name,
              poster: details.posterPath
                ? `https://image.tmdb.org/t/p/w500${details.posterPath}`
                : undefined,
              description: details.overview,
              imdbId: details.externalIds?.imdbId,
              genres: details.genres.map((g) => g.name),
              releaseInfo: `${details.firstAirDate?.slice(0, 4)}-${details.lastAirDate?.slice(0, 4)}`,
              director: directors,
              cast: topActors,
              imdbRating: details.voteAverage.toFixed(1),
              trailers: (details.videos?.results ?? [])
                .filter((v) => v.site === 'YouTube' && v.type === 'Trailer')
                .map((v) => ({ source: v.key, type: 'Trailer' })),
              runtime: details.episodeRunTime[0]
                ? `${Math.floor(details.episodeRunTime[0] / 60)}h ${details.episodeRunTime[0] % 60}m`
                    .replace(/0h /, '')
                    .replace(/ 0m$/, 'h')
                : 'N/A',
              language: details.originalLanguage,
              country: details.productionCountries.map((c) => c.name).join(', '),
            } as StremioMeta;
          }
        }),
      ),
    );

    return { metas };
  }
}
