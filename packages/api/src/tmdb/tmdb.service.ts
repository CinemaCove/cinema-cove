import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TmdbClient } from '@cinemacove/tmdb-client/v3';

export interface TmdbGenre {
  id: number;
  name: string;
}

@Injectable()
export class TmdbService {
  private readonly client: TmdbClient;

  constructor(private readonly configService: ConfigService) {
    this.client = new TmdbClient(
      this.configService.get<string>('TMDB_API_KEY', ''),
    );
  }

  async getLanguages() {
    return (await this.client.configuration.getLanguages()).sort((a, b) =>
      a.englishName.localeCompare(b.englishName),
    );
  }

  async getMovieGenres(): Promise<TmdbGenre[]> {
    const movieRes = await this.client.genre.getMovieGenres();
    return [...movieRes.genres].sort((a, b) => a.name.localeCompare(b.name));
  }

  async getTvShowGenres(): Promise<TmdbGenre[]> {
    const tvRes = await this.client.genre.getTvShowGenres();
    return [...tvRes.genres].sort((a, b) => a.name.localeCompare(b.name));
  }

  async getAllGenres(): Promise<TmdbGenre[]> {
    const [movieRes, tvRes] = await Promise.all([
      this.client.genre.getMovieGenres(),
      this.client.genre.getTvShowGenres(),
    ]);
    const seen = new Set<string>();
    return [...movieRes.genres, ...tvRes.genres]
      .filter((g) => {
        if (seen.has(g.name)) return false;
        seen.add(g.name);
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async resolveMovieGenreIds(genreName: string): Promise<number | undefined> {
    const movieRes = await this.client.genre.getMovieGenres();

    return movieRes.genres.find((g) => g.name === genreName)?.id;
  }

  async resolveTvShowGenreIds(genreName: string): Promise<number | undefined> {
    const res = await this.client.genre.getTvShowGenres();

    return res.genres.find((g) => g.name === genreName)?.id;
  }

  async resolveGenreIds(
    genreName: string,
  ): Promise<{ movieGenreId?: number; tvGenreId?: number }> {
    const [movieRes, tvRes] = await Promise.all([
      this.client.genre.getMovieGenres(),
      this.client.genre.getTvShowGenres(),
    ]);
    return {
      movieGenreId: movieRes.genres.find((g) => g.name === genreName)?.id,
      tvGenreId: tvRes.genres.find((g) => g.name === genreName)?.id,
    };
  }

  discoverMovies(language: string, page: number, genreId?: number) {
    return this.client.discover.searchMovies(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {
        withOriginalLanguage: language,
        sortBy: 'popularity.desc',
        page,
        ...(genreId !== undefined ? { withGenres: String(genreId) } : {}),
      } as any,
    );
  }

  discoverTvShows(language: string, page: number, genreId?: number) {
    return this.client.discover.searchTvShows(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {
        withOriginalLanguage: language,
        sortBy: 'popularity.desc',
        page,
        ...(genreId !== undefined ? { withGenres: String(genreId) } : {}),
      } as any,
    );
  }
}
