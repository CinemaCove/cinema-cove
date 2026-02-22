import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AccountDetailsResult,
  AccountFavoriteMovieResultItem,
  AccountFavoriteTvShowResultItem,
  AccountRatedMovieResultItem,
  AccountRatedTvShowResultItem,
  AccountWatchlistMovieResultItem,
  AccountWatchlistTvShowResultItem,
  ConfigurationLanguage,
  DiscoverMovieResultItem,
  DiscoverTvShowResultItem,
  ListDetailsResult,
  MovieDetailsWithAppends,
  MovieExternalIdsResult,
  PaginatedResult,
  TmdbClient,
  TvShowDetailsWithAppend,
  TvShowExternalIdsResult,
} from '@cinemacove/tmdb-client/v3';

import { CacheService } from '../cache/cache.service';

export type TmdbAccountListItem =
  | AccountWatchlistMovieResultItem
  | AccountWatchlistTvShowResultItem
  | AccountFavoriteMovieResultItem
  | AccountFavoriteTvShowResultItem
  | AccountRatedMovieResultItem
  | AccountRatedTvShowResultItem;

export type SortBy = 'popularity.desc' | 'release_date.desc' | 'vote_average.desc';

export interface DiscoverFilters {
  includeAdult?: boolean;
  minVoteAverage?: number;
  /** Explicit vote count floor. If omitted, defaults to 300/100 when sorting by vote_average. */
  minVoteCount?: number;
  releaseDateFrom?: number;
  releaseDateTo?: number;
}

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
    language: string | undefined,
    page: number,
    sortBy: SortBy = 'popularity.desc',
    genreId?: number,
    search?: string,
    filters: DiscoverFilters = {},
  ): Promise<PaginatedResult<DiscoverMovieResultItem>> {
    const tmdbSort = sortBy === 'release_date.desc' ? 'primary_release_date.desc' : sortBy;
    const voteCountFloor = filters.minVoteCount ?? (sortBy === 'vote_average.desc' ? 300 : undefined);
    const key = `discover:movie:${language ?? 'all'}:${page}:${tmdbSort}:${genreId ?? 'none'}:${search ?? 'none'}:${JSON.stringify(filters)}`;
    return await this.cache.getOrSet(
      key,
      () =>
        this.client.discover.searchMovies({
          ...(language ? { withOriginalLanguage: language } : {}),
          sortBy: tmdbSort,
          page,
          ...(filters.includeAdult !== undefined ? { includeAdult: filters.includeAdult } : {}),
          ...(voteCountFloor !== undefined ? { 'voteCount.gte': voteCountFloor } : {}),
          ...(filters.minVoteAverage !== undefined ? { 'voteAverage.gte': filters.minVoteAverage } : {}),
          ...(filters.releaseDateFrom !== undefined ? { 'primaryReleaseDate.gte': `${filters.releaseDateFrom}-01-01` } : {}),
          ...(filters.releaseDateTo !== undefined ? { 'primaryReleaseDate.lte': `${filters.releaseDateTo}-12-31` } : {}),
          ...(genreId !== undefined ? { withGenres: String(genreId) } : {}),
          ...(search !== undefined ? { withTextQuery: search } : {}),
        } as any),
      this.shortCacheTtl,
    );
  }

  public async discoverTvShows(
    language: string | undefined,
    page: number,
    sortBy: SortBy = 'popularity.desc',
    genreId?: number,
    search?: string,
    filters: DiscoverFilters = {},
  ): Promise<PaginatedResult<DiscoverTvShowResultItem>> {
    const tmdbSort = sortBy === 'release_date.desc' ? 'first_air_date.desc' : sortBy;
    const voteCountFloor = filters.minVoteCount ?? (sortBy === 'vote_average.desc' ? 100 : undefined);
    const key = `discover:tv:${language ?? 'all'}:${page}:${tmdbSort}:${genreId ?? 'none'}:${search ?? 'none'}:${JSON.stringify(filters)}`;
    return await this.cache.getOrSet(
      key,
      () =>
        this.client.discover.searchTvShows({
          ...(language ? { withOriginalLanguage: language } : {}),
          sortBy: tmdbSort,
          page,
          ...(filters.includeAdult !== undefined ? { includeAdult: filters.includeAdult } : {}),
          ...(voteCountFloor !== undefined ? { 'voteCount.gte': voteCountFloor } : {}),
          ...(filters.minVoteAverage !== undefined ? { 'voteAverage.gte': filters.minVoteAverage } : {}),
          ...(filters.releaseDateFrom !== undefined ? { 'firstAirDate.gte': `${filters.releaseDateFrom}-01-01` } : {}),
          ...(filters.releaseDateTo !== undefined ? { 'firstAirDate.lte': `${filters.releaseDateTo}-12-31` } : {}),
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

  async createRequestToken(): Promise<string> {
    const data = await this.client.authentication.getRequestToken();
    if (!data.success) throw new Error('Failed to create TMDB request token');
    return data.requestToken;
  }

  async createSession(requestToken: string): Promise<string> {
    const data = await this.client.authentication.createSession({ requestToken });
    if (!data.success) throw new Error('Failed to create TMDB session');
    return data.sessionId;
  }

  async getTmdbAccount(sessionId: string): Promise<AccountDetailsResult> {
    return this.client.account.getDetails(null, { sessionId });
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.client.authentication.deleteSession({ sessionId });
  }

  async getTmdbUserList(
    listType: 'watchlist' | 'favorites' | 'rated',
    mediaType: 'movie' | 'tv',
    accountId: number,
    sessionId: string,
    page: number = 1,
  ): Promise<PaginatedResult<TmdbAccountListItem>> {
    const opts = { sessionId, page };
    if (listType === 'watchlist') {
      return mediaType === 'movie'
        ? this.client.account.getWatchlistMovies(accountId, opts)
        : this.client.account.getWatchlistTvShows(accountId, opts);
    }
    if (listType === 'favorites') {
      return mediaType === 'movie'
        ? this.client.account.getFavoriteMovies(accountId, opts)
        : this.client.account.getFavoriteTvShows(accountId, opts);
    }
    return mediaType === 'movie'
      ? this.client.account.getRatedMovies(accountId, opts)
      : this.client.account.getRatedTvShows(accountId, opts);
  }

  async getUserCustomLists(
    accountId: number,
    sessionId: string,
    page: number = 1,
  ): Promise<PaginatedResult<{ id: number; name: string; description: string; itemCount: number }>> {
    return this.client.account.getCustomLists(accountId, { sessionId, page }) as Promise<PaginatedResult<{ id: number; name: string; description: string; itemCount: number }>>;
  }

  async getCustomListItems(listId: string, page: number = 1): Promise<ListDetailsResult> {
    return this.client.list.details(Number(listId), { page });
  }
}
