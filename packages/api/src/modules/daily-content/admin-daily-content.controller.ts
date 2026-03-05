import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
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
import { CreateDailyContentDto } from './application/dtos/create-daily-content.dto';
import { UpdateDailyContentDto } from './application/dtos/update-daily-content.dto';
import { GetAllDailyContentQuery } from './application/queries/get-all-daily-content.query';
import { CreateDailyContentCommand } from './application/commands/create-daily-content.command';
import { UpdateDailyContentCommand } from './application/commands/update-daily-content.command';
import { DeleteDailyContentCommand } from './application/commands/delete-daily-content.command';
import { DailyContentDto } from './application/dtos/daily-content.dto';

interface JwtUser {
  sub: string;
}

@UseGuards(AuthGuard('jwt'), AdminGuard, ApiThrottlerGuard)
@Controller('admin/daily-content')
export class AdminDailyContentController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async list(): Promise<DailyContentDto[]> {
    return this.queryBus.execute(new GetAllDailyContentQuery());
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateDailyContentDto): Promise<DailyContentDto> {
    const { sub } = req.user as JwtUser;
    const entity = await this.commandBus.execute(new CreateDailyContentCommand(dto, sub));
    return new DailyContentDto(entity);
  }

  @Patch(':id')
  @HttpCode(200)
  async update(@Param('id') id: string, @Body() dto: UpdateDailyContentDto): Promise<{ ok: boolean }> {
    await this.commandBus.execute(new UpdateDailyContentCommand(id, dto));
    return { ok: true };
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id') id: string): Promise<{ ok: boolean }> {
    await this.commandBus.execute(new DeleteDailyContentCommand(id));
    return { ok: true };
  }
}
