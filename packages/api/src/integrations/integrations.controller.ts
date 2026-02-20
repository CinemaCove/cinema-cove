import {
  BadRequestException,
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
import { UsersService } from '../users/users.service';

@Controller('integrations')
export class IntegrationsController {
  private readonly configureUrl: string;

  constructor(
    private readonly tmdbService: TmdbService,
    private readonly usersService: UsersService,
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

  /**
   * Returns the TMDB authentication URL.
   * Angular opens it via window.location.href so the user can approve on TMDB.
   */
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
}
