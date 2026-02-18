import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConfigurationLanguage,
  DiscoverMovieResultItem,
  DiscoverTvShowResultItem,
  MovieDetailsWithAppends,
  MovieExternalIdsResult,
  PaginatedResult,
  TmdbClient,
  TvShowDetailsWithAppend,
  TvShowExternalIdsResult,
} from '@cinemacove/tmdb-client/v3';
import { CacheService } from '../cache/cache.service';

export type SortBy = 'popularity.desc' | 'release_date.desc' | 'vote_average.desc';

export interface TmdbGenre {
  id: number;
  name: string;
}

@Injectable()
export class TmdbService {
  private readonly client: TmdbClient;
  private readonly shortCacheTtl: number;
  private readonly longCacheTtl: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly cache: CacheService,
  ) {
    this.client = new TmdbClient(
      this.configService.get<string>('TMDB_API_KEY', ''),
    );
    this.shortCacheTtl = parseInt(
      this.configService.get(
        'TMDB_SHORT_CACHE_TTL',
        String(24 * 60 * 60 * 1000),
      ),
      10,
    );
    this.longCacheTtl = parseInt(
      this.configService.get(
        'TMDB_LONG_CACHE_TTL',
        String(30 * 24 * 60 * 60 * 1000),
      ),
      10,
    );
  }

  async getLanguages(): Promise<ConfigurationLanguage[]> {
    return this.cache.getOrSet(
      'languages',
      async () =>
        (await this.client.configuration.getLanguages()).sort((a, b) =>
          a.englishName.localeCompare(b.englishName),
        ),
      this.longCacheTtl,
    );
  }

  async getMovieGenres(): Promise<TmdbGenre[]> {
    return this.cache.getOrSet(
      'genres:movie',
      async () => {
        const res = await this.client.genre.getMovieGenres();
        return [...res.genres].sort((a, b) => a.name.localeCompare(b.name));
      },
      this.longCacheTtl,
    );
  }

  async getTvShowGenres(): Promise<TmdbGenre[]> {
    return this.cache.getOrSet(
      'genres:tv',
      async () => {
        const res = await this.client.genre.getTvShowGenres();
        return [...res.genres].sort((a, b) => a.name.localeCompare(b.name));
      },
      this.longCacheTtl,
    );
  }

  public async resolveMovieGenreIds(genreName: string): Promise<number | undefined> {
    const genres = await this.getMovieGenres();
    return genres.find((g) => g.name === genreName)?.id;
  }

  public async resolveTvShowGenreIds(genreName: string): Promise<number | undefined> {
    const genres = await this.getTvShowGenres();
    return genres.find((g) => g.name === genreName)?.id;
  }

  public async discoverMovies(
    language: string,
    page: number,
    sortBy: SortBy = 'popularity.desc',
    genreId?: number,
    search?: string,
  ): Promise<PaginatedResult<DiscoverMovieResultItem>> {
    const tmdbSort = sortBy === 'release_date.desc' ? 'primary_release_date.desc' : sortBy;
    const key = `discover:movie:${language}:${page}:${tmdbSort}:${genreId ?? 'none'}:${search ?? 'none'}`;
    return this.cache.getOrSet(
      key,
      () =>
        this.client.discover.searchMovies({
          withOriginalLanguage: language,
          sortBy: tmdbSort,
          page,
          ...(genreId !== undefined ? { withGenres: String(genreId) } : {}),
          ...(search !== undefined ? { withTextQuery: search } : {}),
        } as any),
      this.shortCacheTtl,
    );
  }

  public async discoverTvShows(
    language: string,
    page: number,
    sortBy: SortBy = 'popularity.desc',
    genreId?: number,
    search?: string,
  ): Promise<PaginatedResult<DiscoverTvShowResultItem>> {
    const tmdbSort = sortBy === 'release_date.desc' ? 'first_air_date.desc' : sortBy;
    const key = `discover:tv:${language}:${page}:${tmdbSort}:${genreId ?? 'none'}:${search ?? 'none'}`;
    return this.cache.getOrSet(
      key,
      () =>
        this.client.discover.searchTvShows({
          withOriginalLanguage: language,
          sortBy: tmdbSort,
          page,
          ...(genreId !== undefined ? { withGenres: String(genreId) } : {}),
          ...(search !== undefined ? { withTextQuery: search } : {}),
        } as any),
      this.shortCacheTtl,
    );
  }

  public async getMovieExternalIds(movieId: number): Promise<MovieExternalIdsResult> {
    return this.cache.getOrSet(
      `movie:${movieId}:external-ids`,
      () => this.client.movie.getExternalIds(movieId),
      this.shortCacheTtl,
    );
  }

  public async getTvShowExternalIds(tvShowId: number): Promise<TvShowExternalIdsResult> {
    return this.cache.getOrSet(
      `tv-show:${tvShowId}:external-ids`,
      () => this.client.tvShow.getExternalIds(tvShowId),
      this.shortCacheTtl,
    );
  }

  public async getMovieDetails(movieId: number): Promise<MovieDetailsWithAppends> {
    return this.cache.getOrSet(
      `movie:${movieId}:details`,
      () => this.client.movie.getDetails(movieId, { appendToResponse: ['credits', 'videos'] }),
      this.shortCacheTtl,
    );
  }

  public async getTvShowDetails(tvShowId: number): Promise<TvShowDetailsWithAppend> {
    return this.cache.getOrSet(
      `tv-show:${tvShowId}:details`,
      () =>
        this.client.tvShow.getDetails(tvShowId, {
          appendToResponse: ['external_ids', 'credits', 'videos'],
          language: 'en-US',
        }),
      this.shortCacheTtl,
    );
  }
}
