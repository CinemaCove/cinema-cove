import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import { AdminGuard } from '../../common/guards/admin.guard';
import { ApiThrottlerGuard } from '../../common/guards/throttler.guards';
import { CreateAnnouncementDto } from './application/dtos/create-announcement.dto';
import { UpdateAnnouncementDto } from './application/dtos/update-announcement.dto';
import { AnnouncementDto } from './application/dtos/announcement.dto';
import { GetAllAnnouncementsQuery } from './application/queries/get-all-announcements.query';
import { CreateAnnouncementCommand } from './application/commands/create-announcement.command';
import { UpdateAnnouncementCommand } from './application/commands/update-announcement.command';
import { DeleteAnnouncementCommand } from './application/commands/delete-announcement.command';

interface JwtUser {
  sub: string;
}

@UseGuards(AuthGuard('jwt'), AdminGuard, ApiThrottlerGuard)
@Controller('admin/announcements')
export class AdminAnnouncementsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async list(): Promise<AnnouncementDto[]> {
    return this.queryBus.execute(new GetAllAnnouncementsQuery());
  }

  @Post()
  async create(
    @Req() req: Request,
    @Body() dto: CreateAnnouncementDto,
  ): Promise<AnnouncementDto> {
    const { sub } = req.user as JwtUser;
    const entity = await this.commandBus.execute(
      new CreateAnnouncementCommand(dto, sub),
    );
    return new AnnouncementDto(entity);
  }

  @Patch(':id')
  @HttpCode(200)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAnnouncementDto,
  ): Promise<{ ok: boolean }> {
    await this.commandBus.execute(new UpdateAnnouncementCommand(id, dto));
    return { ok: true };
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id') id: string): Promise<{ ok: boolean }> {
    await this.commandBus.execute(new DeleteAnnouncementCommand(id));
    return { ok: true };
  }
}
