import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { TmdbService } from '../tmdb/tmdb.service';
import { TraktService } from '../trakt/trakt.service';
import { UsersService } from '../users/users.service';
import { AddonConfigsService } from '../addon-configs/addon-configs.service';

const TRAKT_BUILTIN_LISTS = [
  { listType: 'watchlist' as const, type: 'movie' as const, label: 'Movie Watchlist', icon: 'bookmark' },
  { listType: 'watchlist' as const, type: 'tv' as const,    label: 'TV Watchlist',    icon: 'bookmark' },
  { listType: 'favorites' as const, type: 'movie' as const, label: 'Favorite Movies', icon: 'favorite' },
  { listType: 'favorites' as const, type: 'tv' as const,    label: 'Favorite Shows',  icon: 'favorite' },
  { listType: 'rated' as const,     type: 'movie' as const, label: 'Rated Movies',    icon: 'star' },
  { listType: 'rated' as const,     type: 'tv' as const,    label: 'Rated Shows',     icon: 'star' },
];

const BUILTIN_LISTS = [
  { listType: 'watchlist' as const, type: 'movie' as const, label: 'Movie Watchlist', icon: 'bookmark' },
  { listType: 'watchlist' as const, type: 'tv' as const,    label: 'TV Watchlist',    icon: 'bookmark' },
  { listType: 'favorites' as const, type: 'movie' as const, label: 'Favorite Movies', icon: 'favorite' },
  { listType: 'favorites' as const, type: 'tv' as const,    label: 'Favorite Shows',  icon: 'favorite' },
  { listType: 'rated' as const,     type: 'movie' as const, label: 'Rated Movies',    icon: 'star' },
  { listType: 'rated' as const,     type: 'tv' as const,    label: 'Rated Shows',     icon: 'star' },
];

@Controller('integrations')
export class IntegrationsController {
  private readonly configureUrl: string;

  constructor(
    private readonly tmdbService: TmdbService,
    private readonly traktService: TraktService,
    private readonly usersService: UsersService,
    private readonly addonConfigsService: AddonConfigsService,
    configService: ConfigService,
  ) {
    this.configureUrl = configService.getOrThrow<string>('CONFIGURE_URL');
  }

  // ── Status ────────────────────────────────────────────────────────────────

  @Get('tmdb/status')
  @UseGuards(AuthGuard('jwt'))
  async tmdbStatus(@Req() req: Request & { user: { sub: string } }) {
    const user = await this.usersService.findById(req.user.sub);
    return {
      connected: !!user?.tmdbSessionId,
      accountId: user?.tmdbAccountId ?? null,
      username: user?.tmdbUsername ?? null,
    };
  }

  // ── Connect ───────────────────────────────────────────────────────────────

  @Post('tmdb/connect')
  @UseGuards(AuthGuard('jwt'))
  async tmdbConnect(
    @Req() req: Request & { user: { sub: string } },
  ): Promise<{ authUrl: string }> {
    const requestToken = await this.tmdbService.createRequestToken();
    const host = req.get('X-Forwarded-Host') ?? req.get('host');
    const protocol = req.get('X-Forwarded-Proto') ?? req.protocol;
    const callbackUrl = encodeURIComponent(
      `${protocol}://${host}/api/integrations/tmdb/callback?userId=${req.user.sub}`,
    );
    const authUrl = `https://www.themoviedb.org/authenticate/${requestToken}?redirect_to=${callbackUrl}`;
    return { authUrl };
  }

  // ── Callback ──────────────────────────────────────────────────────────────

  @Get('tmdb/callback')
  async tmdbCallback(
    @Query('request_token') requestToken: string,
    @Query('approved') approved: string,
    @Query('userId') userId: string,
    @Res() res: Response,
  ) {
    if (approved !== 'true' || !requestToken || !userId) {
      throw new BadRequestException('TMDB connection was denied or parameters are missing');
    }

    const sessionId = await this.tmdbService.createSession(requestToken);
    const account = await this.tmdbService.getTmdbAccount(sessionId);
    await this.usersService.saveTmdbSession(userId, sessionId, account.id, account.username);

    res.redirect(`${this.configureUrl}/integrations?tmdb=connected`);
  }

  // ── Disconnect ────────────────────────────────────────────────────────────

  @Delete('tmdb/disconnect')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'))
  async tmdbDisconnect(@Req() req: Request & { user: { sub: string } }) {
    const user = await this.usersService.findById(req.user.sub);
    if (user?.tmdbSessionId) {
      await this.tmdbService.deleteSession(user.tmdbSessionId);
    }
    await this.usersService.clearTmdbSession(req.user.sub);
  }

  // ── Lists ─────────────────────────────────────────────────────────────────

  @Get('tmdb/lists')
  @UseGuards(AuthGuard('jwt'))
  async getTmdbLists(
    @Req() req: Request & { user: { sub: string } },
    @Query('page') pageStr?: string,
  ) {
    const user = await this.usersService.findById(req.user.sub);
    if (!user?.tmdbSessionId || !user?.tmdbAccountId) {
      return { builtinLists: [], customLists: [], totalPages: 0, page: 1 };
    }

    const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1);

    const [builtinResults, customData] = await Promise.all([
      Promise.all(
        BUILTIN_LISTS.map(async (def) => {
          const data = await this.tmdbService.getTmdbUserList(
            def.listType,
            def.type,
            user.tmdbAccountId!,
            user.tmdbSessionId!,
            1,
          );
          return {
            listType: def.listType,
            type: def.type,
            label: def.label,
            icon: def.icon,
            itemCount: data.total_results ?? 0,
          };
        }),
      ),
      this.tmdbService.getUserCustomLists(user.tmdbAccountId, user.tmdbSessionId, page),
    ]);

    return {
      builtinLists: builtinResults,
      customLists: customData.results.map((l) => ({
        id: String(l.id),
        name: l.name,
        description: l.description,
        itemCount: l.item_count,
      })),
      totalPages: customData.total_pages,
      page,
    };
  }

  @Post('tmdb/lists/install')
  @UseGuards(AuthGuard('jwt'))
  async installTmdbList(
    @Req() req: Request & { user: { sub: string } },
    @Body()
    body:
      | { kind: 'builtin'; listType: 'watchlist' | 'favorites' | 'rated'; type: 'movie' | 'tv'; label: string }
      | { kind: 'custom'; listId: string; name: string },
  ) {
    let doc;
    if (body.kind === 'builtin') {
      const def = BUILTIN_LISTS.find((d) => d.listType === body.listType && d.type === body.type);
      if (!def) throw new BadRequestException('Invalid built-in list');
      doc =
        (await this.addonConfigsService.findExistingTmdbList(req.user.sub, {
          tmdbListType: body.listType,
          type: body.type,
        })) ??
        (await this.addonConfigsService.create(req.user.sub, {
          name: body.label,
          type: body.type,
          languages: [],
          sort: 'popularity.desc',
          source: 'tmdb-list',
          tmdbListType: body.listType,
        }));
    } else {
      if (!body.listId || !body.name) throw new BadRequestException('listId and name are required');
      doc =
        (await this.addonConfigsService.findExistingTmdbList(req.user.sub, {
          tmdbListId: body.listId,
        })) ??
        (await this.addonConfigsService.create(req.user.sub, {
          name: body.name,
          type: 'movie', // placeholder — ignored for custom list
          languages: [],
          sort: 'popularity.desc',
          source: 'tmdb-list',
          tmdbListId: body.listId,
        }));
    }

    const host = req.get('X-Forwarded-Host') ?? req.get('host');
    const installUrl = `stremio://${host}/api/${doc._id}/manifest.json`;
    return { id: doc._id, installUrl };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Trakt
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Status ────────────────────────────────────────────────────────────────

  @Get('trakt/status')
  @UseGuards(AuthGuard('jwt'))
  async traktStatus(@Req() req: Request & { user: { sub: string } }) {
    const user = await this.usersService.findById(req.user.sub);
    return {
      connected: !!user?.traktAccessToken,
      username: user?.traktUsername ?? null,
    };
  }

  // ── Connect ───────────────────────────────────────────────────────────────

  @Post('trakt/connect')
  @UseGuards(AuthGuard('jwt'))
  async traktConnect(
    @Req() req: Request & { user: { sub: string } },
  ): Promise<{ authUrl: string }> {
    const host = req.get('X-Forwarded-Host') ?? req.get('host');
    const protocol = req.get('X-Forwarded-Proto') ?? req.protocol;
    const callbackUrl = `${protocol}://${host}/api/integrations/trakt/callback?userId=${req.user.sub}`;
    const authUrl = this.traktService.getAuthUrl(callbackUrl);
    return { authUrl };
  }

  // ── Callback ──────────────────────────────────────────────────────────────

  @Get('trakt/callback')
  async traktCallback(
    @Query('code') code: string,
    @Query('userId') userId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    if (!code || !userId) {
      throw new BadRequestException('Trakt connection was denied or parameters are missing');
    }

    const host = req.get('X-Forwarded-Host') ?? req.get('host');
    const protocol = req.get('X-Forwarded-Proto') ?? req.protocol;
    const redirectUri = `${protocol}://${host}/api/integrations/trakt/callback?userId=${userId}`;

    const tokens = await this.traktService.exchangeCode(code, redirectUri);

    let username = '';
    try {
      const profile = await this.traktService.getProfile(tokens.accessToken);
      username = (profile as any).username ?? '';
    } catch {
      username = '';
    }

    await this.usersService.saveTraktTokens(userId, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      username,
      expiresAt: tokens.createdAt + tokens.expiresIn,
    });

    res.redirect(`${this.configureUrl}/integrations?trakt=connected`);
  }

  // ── Disconnect ────────────────────────────────────────────────────────────

  @Delete('trakt/disconnect')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'))
  async traktDisconnect(@Req() req: Request & { user: { sub: string } }) {
    await this.usersService.clearTraktTokens(req.user.sub);
  }

  // ── Lists ─────────────────────────────────────────────────────────────────

  @Get('trakt/lists')
  @UseGuards(AuthGuard('jwt'))
  async getTraktLists(@Req() req: Request & { user: { sub: string } }) {
    const user = await this.usersService.findById(req.user.sub);
    if (!user?.traktAccessToken) {
      return { builtinLists: [], customLists: [] };
    }

    const token = user.traktAccessToken;

    const [builtinResults, customLists] = await Promise.all([
      Promise.all(
        TRAKT_BUILTIN_LISTS.map(async (def) => {
          const traktType = def.type === 'movie' ? 'movies' : 'shows';
          let itemCount = 0;
          try {
            const items =
              def.listType === 'watchlist'
                ? await this.traktService.getWatchlist(token, traktType, 1, 1)
                : def.listType === 'favorites'
                  ? await this.traktService.getFavorites(token, traktType, 1, 1)
                  : await this.traktService.getRatings(token, traktType, 1, 1);
            itemCount = (items as unknown[]).length;
          } catch {
            itemCount = 0;
          }
          return {
            listType: def.listType,
            type: def.type,
            label: def.label,
            icon: def.icon,
            itemCount,
          };
        }),
      ),
      this.traktService.getUserLists(token).then((lists) =>
        lists.map((l) => ({
          id: String(l.ids.trakt),
          slug: l.ids.slug,
          name: l.name,
          description: l.description ?? '',
          itemCount: l.itemCount,
        })),
      ),
    ]);

    return { builtinLists: builtinResults, customLists };
  }

  @Post('trakt/lists/install')
  @UseGuards(AuthGuard('jwt'))
  async installTraktList(
    @Req() req: Request & { user: { sub: string } },
    @Body()
    body:
      | { kind: 'builtin'; listType: 'watchlist' | 'favorites' | 'rated'; type: 'movie' | 'tv'; label: string }
      | { kind: 'custom'; listId: string; slug: string; name: string },
  ) {
    let doc;
    if (body.kind === 'builtin') {
      const def = TRAKT_BUILTIN_LISTS.find((d) => d.listType === body.listType && d.type === body.type);
      if (!def) throw new BadRequestException('Invalid Trakt built-in list');
      doc =
        (await this.addonConfigsService.findExistingTraktList(req.user.sub, {
          traktListType: body.listType,
          type: body.type,
        })) ??
        (await this.addonConfigsService.create(req.user.sub, {
          name: body.label,
          type: body.type,
          languages: [],
          sort: 'popularity.desc',
          source: 'trakt-list',
          traktListType: body.listType,
        }));
    } else {
      if (!body.listId || !body.name) throw new BadRequestException('listId and name are required');
      doc =
        (await this.addonConfigsService.findExistingTraktList(req.user.sub, {
          traktListId: body.listId,
        })) ??
        (await this.addonConfigsService.create(req.user.sub, {
          name: body.name,
          type: 'movie',
          languages: [],
          sort: 'popularity.desc',
          source: 'trakt-list',
          traktListId: body.listId,
        }));
    }

    const host = req.get('X-Forwarded-Host') ?? req.get('host');
    const installUrl = `stremio://${host}/api/${doc._id}/manifest.json`;
    return { id: doc._id, installUrl };
  }
}
