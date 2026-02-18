import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DiscoverMovieResultItem,
  DiscoverTvShowResultItem,
} from '@cinemacove/tmdb-client/v3';
import { TmdbService } from '../tmdb/tmdb.service';
import { AddonConfig } from './types/addon-config.interface';

interface StremioMeta {
  id: string;
  type: string;
  name: string;
  poster?: string;
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
    genreName?: string,
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
        ? (await this.tmdbService.discoverMovies(lang, page, genreId)).results
        : (await this.tmdbService.discoverTvShows(lang, page, genreId)).results;

    const stremioType = type === 'movie' ? 'movie' : 'series';
    const metas: StremioMeta[] = results.map((item) => ({
      id: `tmdb:${item.id}`,
      type: stremioType,
      name: 'title' in item ? item.title : item.name,
      poster: item.posterPath
        ? `https://image.tmdb.org/t/p/w500${item.posterPath}`
        : undefined,
    }));

    return { metas };
  }
}
