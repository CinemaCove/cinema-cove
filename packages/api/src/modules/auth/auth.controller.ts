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
import { AuthService } from './services';
import { LoginDto, RegisterDto, TokenResponseDto } from './dtos';

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
  async register(@Body() body: RegisterDto): Promise<TokenResponseDto> {
    return await this.authService.register(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<TokenResponseDto> {
    return await this.authService.login(dto);
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
