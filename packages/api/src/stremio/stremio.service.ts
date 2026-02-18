import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TmdbService } from '../tmdb/tmdb.service';
import { AddonConfig } from './types/addon-config.interface';

interface StremioMeta {
  id: string;
  type: string;
  name: string;
  poster?: string;
}

interface StremioMetaWithPop extends StremioMeta {
  popularity: number;
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

    let genreId: number | undefined;

    if (genreName) {
      genreId =
        type == 'movie'
          ? await this.tmdbService.resolveMovieGenreIds(genreName)
          : await this.tmdbService.getTvShowGenres();
    }

    const data =
      type == 'movie'
        ? await this.tmdbService.discoverMovies(lang, page, genreId)
        : await this.tmdbService.discoverTvShows(lang, page, genreId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toMeta = (
      item: any,
      type: 'movie' | 'series',
      titleKey: string,
    ): StremioMetaWithPop => ({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/restrict-template-expressions
      id: `tmdb:${item.id}`,
      type,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      name: item[titleKey],
      poster: item.posterPath
        ? // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          `https://image.tmdb.org/t/p/w500${item.posterPath}`
        : undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      popularity: item.popularity ?? 0,
    });

    const metas = (data.results as any[]).map((i) =>
      toMeta(
        i,
        type === 'movie' ? 'movie' : 'series',
        type === 'movie' ? 'title' : 'name',
      ),
    );

    return { metas };
  }
}
