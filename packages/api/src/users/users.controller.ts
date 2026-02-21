import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { UsersService } from './users.service';

interface JwtUser {
  sub: string;
  email?: string;
}

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Req() req: Request) {
    const { sub } = req.user as JwtUser;
    const user = await this.usersService.findById(sub);
    if (!user) throw new UnauthorizedException();
    return {
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      hasPassword: !!user.passwordHash,
    };
  }

  @Patch('me')
  async updateProfile(
    @Req() req: Request,
    @Body()
    body: {
      displayName?: string;
      currentPassword?: string;
      newPassword?: string;
    },
  ) {
    const { sub } = req.user as JwtUser;

    if (body.displayName !== undefined) {
      const trimmed = body.displayName.trim();
      if (trimmed.length > 50) throw new BadRequestException('Display name too long');
      await this.usersService.updateDisplayName(sub, trimmed);
    }

    if (body.newPassword !== undefined) {
      if (!body.newPassword || body.newPassword.length < 8) {
        throw new BadRequestException('Password must be at least 8 characters');
      }

      const user = await this.usersService.findById(sub);
      if (!user) throw new UnauthorizedException();

      if (user.passwordHash) {
        // Changing existing password — require current password
        if (!body.currentPassword) {
          throw new BadRequestException('Current password is required');
        }
        const ok = await this.usersService.updatePassword(sub, body.currentPassword, body.newPassword);
        if (!ok) throw new BadRequestException('Current password is incorrect');
      } else {
        // OAuth user setting a password for the first time
        await this.usersService.setPassword(sub, body.newPassword);
      }
    }

    return { ok: true };
  }
}
