import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import type { UserDocument } from '../users/schemas/user.schema';

interface OAuthResult {
  token: string;
}

@Controller('auth')
export class AuthController {
  private readonly configureUrl: string;

  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    this.configureUrl = configService.getOrThrow<string>('CONFIGURE_URL');
  }

  @Post('register')
  async register(
    @Body() body: { email: string; password: string; displayName?: string },
  ): Promise<{ token: string }> {
    return this.authService.register(body.email, body.password, body.displayName);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  login(@Req() req: Request): { token: string } {
    return { token: this.authService.signJwt(req.user as UserDocument) };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth(): void {
    // Passport redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: Request, @Res() res: Response): void {
    const { token } = req.user as OAuthResult;
    res.redirect(`${this.configureUrl}/auth/callback?token=${token}`);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  facebookAuth(): void {
    // Passport redirects to Facebook
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  facebookCallback(@Req() req: Request, @Res() res: Response): void {
    const { token } = req.user as OAuthResult;
    res.redirect(`${this.configureUrl}/auth/callback?token=${token}`);
  }
}
