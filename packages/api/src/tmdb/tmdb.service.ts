import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConfigurationLanguage,
  DiscoverMovieResultItem,
  DiscoverTvShowResultItem,
  MovieDetail,
  MovieDetailsWithAppends,
  MovieExternalIdsResult,
  PaginatedResult,
  TmdbClient,
  TvShowDetailsWithAppend,
  TvShowExternalIdsResult,
} from '@cinemacove/tmdb-client/v3';
import { CacheService } from '../cache/cache.service';

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
    this.shortCacheTtl = this.configService.get<number>(
      'TMDB_SHORT_CACHE_TTL',
      24 * 60 * 60 * 1000,
    );
    this.longCacheTtl = this.configService.get<number>(
      'TMDB_LONG_CACHE_TTL',
      30 * 24 * 60 * 60 * 1000,
    );
  }

  async getLanguages(): Promise<ConfigurationLanguage[]> {
    const cached = await this.cache.get<ConfigurationLanguage[]>('languages');
    if (cached) return cached;

    const result = (await this.client.configuration.getLanguages()).sort(
      (a, b) => a.englishName.localeCompare(b.englishName),
    );
    await this.cache.set('languages', result, this.longCacheTtl);
    return result;
  }

  async getMovieGenres(): Promise<TmdbGenre[]> {
    const cached = await this.cache.get<TmdbGenre[]>('genres:movie');
    if (cached) return cached;

    const movieRes = await this.client.genre.getMovieGenres();
    const result = [...movieRes.genres].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    await this.cache.set('genres:movie', result, this.longCacheTtl);
    return result;
  }

  async getTvShowGenres(): Promise<TmdbGenre[]> {
    const cached = await this.cache.get<TmdbGenre[]>('genres:tv');
    if (cached) return cached;

    const tvRes = await this.client.genre.getTvShowGenres();
    const result = [...tvRes.genres].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    await this.cache.set('genres:tv', result, this.longCacheTtl);
    return result;
  }

  async resolveMovieGenreIds(genreName: string): Promise<number | undefined> {
    const genres = await this.getMovieGenres();
    return genres.find((g) => g.name === genreName)?.id;
  }

  async resolveTvShowGenreIds(genreName: string): Promise<number | undefined> {
    const genres = await this.getTvShowGenres();
    return genres.find((g) => g.name === genreName)?.id;
  }

  async discoverMovies(
    language: string,
    page: number,
    genreId?: number,
    search?: string,
  ): Promise<PaginatedResult<DiscoverMovieResultItem>> {
    const key = `discover:movie:${language}:${page}:${genreId ?? 'none'}:${search ?? 'none'}`;
    const cached =
      await this.cache.get<PaginatedResult<DiscoverMovieResultItem>>(key);
    if (cached) return cached;

    const result = await this.client.discover.searchMovies({
      withOriginalLanguage: language,
      sortBy: 'popularity.desc',
      page,
      ...(genreId !== undefined ? { withGenres: String(genreId) } : {}),
      ...(search !== undefined ? { withTextQuery: search } : {}),
    });
    await this.cache.set(key, result, this.shortCacheTtl);
    return result;
  }

  async discoverTvShows(
    language: string,
    page: number,
    genreId?: number,
    search?: string,
  ): Promise<PaginatedResult<DiscoverTvShowResultItem>> {
    const key = `discover:tv:${language}:${page}:${genreId ?? 'none'}:${search ?? 'none'}`;
    const cached =
      await this.cache.get<PaginatedResult<DiscoverTvShowResultItem>>(key);
    if (cached) return cached;

    const result = await this.client.discover.searchTvShows({
      withOriginalLanguage: language,
      sortBy: 'popularity.desc',
      page,
      ...(genreId !== undefined ? { withGenres: String(genreId) } : {}),
      ...(search !== undefined ? { withTextQuery: search } : {}),
    });
    await this.cache.set(key, result, this.shortCacheTtl);
    return result;
  }

  async getMovieExternalIds(movieId: number): Promise<MovieExternalIdsResult> {
    const key = `movie:${movieId}:external-ids`;
    const cached = await this.cache.get<MovieExternalIdsResult>(key);
    if (cached) return cached;

    const result: MovieExternalIdsResult =
      await this.client.movie.getExternalIds(movieId);
    await this.cache.set(key, result, this.shortCacheTtl);
    return result;
  }

  async getTvShowExternalIds(
    tvShowId: number,
  ): Promise<TvShowExternalIdsResult> {
    const key = `tv-show:${tvShowId}:external-ids`;
    const cached = await this.cache.get<TvShowExternalIdsResult>(key);
    if (cached) return cached;

    const result: TvShowExternalIdsResult =
      await this.client.tvShow.getExternalIds(tvShowId);
    await this.cache.set(key, result, this.shortCacheTtl);
    return result;
  }

  async getMovieDetails(movieId: number): Promise<MovieDetailsWithAppends> {
    const key = `movie:${movieId}:details`;
    const cached = await this.cache.get<MovieDetailsWithAppends>(key);
    if (cached) return cached;

    const result: MovieDetailsWithAppends = await this.client.movie.getDetails(
      movieId,
      {
        appendToResponse: ['credits', 'videos'],
      },
    );
    await this.cache.set(key, result, this.shortCacheTtl);
    return result;
  }

  async getTvShowDetails(tvShowId: number): Promise<TvShowDetailsWithAppend> {
    const key = `tv-show:${tvShowId}:details`;
    const cached = await this.cache.get<TvShowDetailsWithAppend>(key);
    if (cached) return cached;

    const result: TvShowDetailsWithAppend = await this.client.tvShow.getDetails(
      tvShowId,
      {
        appendToResponse: ['external_ids', 'credits', 'videos'],
        language: 'en-US',
      },
    );
    await this.cache.set(key, result, this.shortCacheTtl);
    return result;
  }
}
