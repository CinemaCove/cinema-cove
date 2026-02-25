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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  GetProfileQuery,
  UpdateProfileCommand,
  UpdateProfileDto,
} from './application';
interface JwtUser {
  sub: string;
  email?: string;
}

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('me')
  async getProfile(@Req() req: Request) {
    const { sub } = req.user as JwtUser;

    const res = await this.queryBus.execute(new GetProfileQuery(sub));
    if (!res) {
      throw new UnauthorizedException();
    }

    return res;
  }

  @Patch('me')
  async updateProfile(
    @Req() req: Request,
    @Body()
    body: UpdateProfileDto,
  ) {
    const { sub } = req.user as JwtUser;

    await this.commandBus.execute(
      new UpdateProfileCommand(
        sub,
        body.displayName,
        body.currentPassword,
        body.newPassword,
      ),
    );

    return { ok: true };
  }
}
