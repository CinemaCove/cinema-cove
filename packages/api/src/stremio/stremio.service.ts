import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DiscoverMovieResultItem,
  DiscoverTvShowResultItem,
  MovieDetailsWithAppends,
  SearchMoviesResultItem,
  SearchTvShowsResultItem,
} from '@cinemacove/tmdb-client/v3';
import { SortBy, TmdbService } from '../tmdb/tmdb.service';
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
    private readonly configService: ConfigService,
  ) {}

  async buildManifest(config: AddonConfig): Promise<object> {
    const languages = await this.tmdbService.getLanguages();
    const genres =
      config.type === 'movie'
        ? await this.tmdbService.getMovieGenres()
        : await this.tmdbService.getTvShowGenres();

    const langMap = new Map(
      languages.map((l) => [l.iso639_1, l.englishName || l.name]),
    );

    const nameLower = config.name.toLowerCase();
    const catalogType = `CinemaCove-${config.name}`;
    const genreOptions = genres.map((g) => g.name);

    const catalogs = config.languages.map((lang) => ({
      type: catalogType,
      id: `cinemacove-${nameLower}-${lang}`,
      name: langMap.get(lang) ?? lang,
      extra: [
        { name: 'search', isRequired: false },
        { name: 'genre', isRequired: false, options: genreOptions },
        { name: 'skip', isRequired: false },
      ],
    }));

    const configureUrl = this.configService.get<string>(
      'CONFIGURE_URL',
      'http://localhost:4200',
    );

    return {
      id: `com.cinemacove.${nameLower}`,
      version: '1.0.0',
      name: `CinemaCove-${config.name}`,
      resources: ['catalog'],
      types: [catalogType],
      catalogs,
      behaviorHints: {
        configurable: true,
        configurationURL: configureUrl,
      },
    };
  }

  async buildCatalog(
    type: 'movie' | 'tv',
    catalogId: string,
    skip: number,
    sort: SortBy = 'popularity.desc',
    genreName?: string,
    search?: string,
  ): Promise<object> {
    const lang = catalogId.split('-').pop()!;
    const page = Math.floor(skip / 20) + 1;

    const genreId = genreName
      ? type === 'movie'
        ? await this.tmdbService.resolveMovieGenreIds(genreName)
        : await this.tmdbService.resolveTvShowGenreIds(genreName)
      : undefined;

    const results: (DiscoverMovieResultItem | DiscoverTvShowResultItem)[] =
      type === 'movie'
        ? (await this.tmdbService.discoverMovies(lang, page, sort, genreId, search)).results
        : (await this.tmdbService.discoverTvShows(lang, page, sort, genreId, search)).results;

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

    // const stremioType = type === 'movie' ? 'movie' : 'series';
    // const metas: StremioMeta[] = resultsWithDetails.map(
    //   (item) =>
    //     ({
    //       id: `${item.imdbId}`,
    //       type: stremioType,
    //       name: 'title' in item ? item.title : item.name,
    //       poster: item.posterPath
    //         ? `https://image.tmdb.org/t/p/w500${item.posterPath}`
    //         : undefined,
    //       description: item.overview,
    //       imdbRating: '8.5',
    //     }) as any,
    // );

    return { metas };
  }
}
