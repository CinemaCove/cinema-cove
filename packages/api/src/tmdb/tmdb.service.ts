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
    return await this.cache.getOrSet(
      'languages',
      async () =>
        (await this.client.configuration.getLanguages()).sort((a, b) =>
          a.englishName.localeCompare(b.englishName),
        ),
      this.longCacheTtl,
    );
  }

  async getMovieGenres(): Promise<TmdbGenre[]> {
    return await this.cache.getOrSet(
      'genres:movie',
      async () => {
        const res = await this.client.genre.getMovieGenres();
        return [...res.genres].sort((a, b) => a.name.localeCompare(b.name));
      },
      this.longCacheTtl,
    );
  }

  async getTvShowGenres(): Promise<TmdbGenre[]> {
    return await this.cache.getOrSet(
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
    return await this.cache.getOrSet(
      key,
      () =>
        this.client.discover.searchMovies({
          withOriginalLanguage: language,
          sortBy: tmdbSort,
          page,
          ...(sortBy === 'vote_average.desc' ? { 'voteCount.gte': 300 } : {}),
          ...(genreId !== undefined ? { withGenres: String(genreId) } : {}),
          ...(search !== undefined ? { withTextQuery: search } : {}),
        }),
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
    return await this.cache.getOrSet(
      key,
      () =>
        this.client.discover.searchTvShows({
          withOriginalLanguage: language,
          sortBy: tmdbSort,
          page,
          ...(sortBy === 'vote_average.desc' ? { 'voteCount.gte': 100 } : {}),
          ...(genreId !== undefined ? { withGenres: String(genreId) } : {}),
          ...(search !== undefined ? { withTextQuery: search } : {}),
        } as any),
      this.shortCacheTtl,
    );
  }

  public async getMovieExternalIds(movieId: number): Promise<MovieExternalIdsResult> {
    return await this.cache.getOrSet(
      `movie:${movieId}:external-ids`,
      () => this.client.movie.getExternalIds(movieId),
      this.shortCacheTtl,
    );
  }

  public async getTvShowExternalIds(tvShowId: number): Promise<TvShowExternalIdsResult> {
    return await this.cache.getOrSet(
      `tv-show:${tvShowId}:external-ids`,
      () => this.client.tvShow.getExternalIds(tvShowId),
      this.shortCacheTtl,
    );
  }

  public async getMovieDetails(movieId: number): Promise<MovieDetailsWithAppends> {
    return await this.cache.getOrSet(
      `movie:${movieId}:details`,
      () => this.client.movie.getDetails(movieId, { appendToResponse: ['credits', 'videos'] }),
      this.shortCacheTtl,
    );
  }

  public async getTvShowDetails(tvShowId: number): Promise<TvShowDetailsWithAppend> {
    return await this.cache.getOrSet(
      `tv-show:${tvShowId}:details`,
      () =>
        this.client.tvShow.getDetails(tvShowId, {
          appendToResponse: ['external_ids', 'credits', 'videos'],
          language: 'en-US',
        }),
      this.shortCacheTtl,
    );
  }

  // ── TMDB User Auth ─────────────────────────────────────────────────────────

  private get apiKey(): string {
    return this.configService.getOrThrow<string>('TMDB_API_KEY');
  }

  async createRequestToken(): Promise<string> {
    const res = await fetch(
      `https://api.themoviedb.org/3/authentication/token/new?api_key=${this.apiKey}`,
    );
    const data = (await res.json()) as { success: boolean; request_token: string };
    if (!data.success) throw new Error('Failed to create TMDB request token');
    return data.request_token;
  }

  async createSession(requestToken: string): Promise<string> {
    const res = await fetch(
      `https://api.themoviedb.org/3/authentication/session/new?api_key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_token: requestToken }),
      },
    );
    const data = (await res.json()) as { success: boolean; session_id: string };
    if (!data.success) throw new Error('Failed to create TMDB session');
    return data.session_id;
  }

  async getTmdbAccount(sessionId: string): Promise<{ id: number; username: string }> {
    const res = await fetch(
      `https://api.themoviedb.org/3/account?api_key=${this.apiKey}&session_id=${sessionId}`,
    );
    return res.json() as Promise<{ id: number; username: string }>;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await fetch(
      `https://api.themoviedb.org/3/authentication/session?api_key=${this.apiKey}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      },
    );
  }

  async getTmdbUserList(
    listType: 'watchlist' | 'favorites' | 'rated',
    mediaType: 'movie' | 'tv',
    accountId: number,
    sessionId: string,
    page: number = 1,
  ): Promise<{ results: any[]; total_results: number; total_pages: number }> {
    const endpoint = listType === 'watchlist'
      ? `watchlist/${mediaType === 'movie' ? 'movies' : 'tv'}`
      : listType === 'favorites'
        ? `favorite/${mediaType === 'movie' ? 'movies' : 'tv'}`
        : `rated/${mediaType === 'movie' ? 'movies' : 'tv'}`;

    const res = await fetch(
      `https://api.themoviedb.org/3/account/${accountId}/${endpoint}?api_key=${this.apiKey}&session_id=${sessionId}&page=${page}`,
    );
    return res.json() as Promise<{ results: any[]; total_results: number; total_pages: number }>;
  }
}
