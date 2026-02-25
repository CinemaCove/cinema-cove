import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateAddonConfigCommand,
  CreateAddonConfigDto,
  DeleteAddonConfigCommand,
  GetAddonConfigsByOwnerQuery,
  AddonConfigResponseDto,
  UpdateAddonConfigCommand,
  UpdateAddonConfigDto,
} from './application';
import { GetUserByIdQuery } from '../users/application';

@UseGuards(AuthGuard('jwt'))
@Controller('addon-configs')
export class AddonConfigsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Post()
  async create(
    @Req() req: Request & { user: { sub: string } },
    @Body() body: CreateAddonConfigDto,
  ) {
    const user = await this.queryBus.execute(new GetUserByIdQuery(req.user.sub));
    const maxAllowed = user?.maxAllowedConfigs ?? 20;
    const entity = await this.commandBus.execute(
      new CreateAddonConfigCommand(req.user.sub, body, maxAllowed),
    );
    return { id: entity.id };
  }

  @Get()
  async list(@Req() req: Request & { user: { sub: string } }) {
    const configs: AddonConfigResponseDto[] = await this.queryBus.execute(
      new GetAddonConfigsByOwnerQuery(req.user.sub),
    );
    return configs.map((c) => ({
      ...c,
      installUrl: `stremio://${req.get('host')}/api/${c.id}/manifest.json`,
    }));
  }

  @Patch(':id')
  async update(
    @Req() req: Request & { user: { sub: string } },
    @Param('id') id: string,
    @Body() body: UpdateAddonConfigDto,
  ) {
    const entity = await this.commandBus.execute(
      new UpdateAddonConfigCommand(id, req.user.sub, body),
    );

    return { id: entity.id };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: Request & { user: { sub: string } },
    @Param('id') id: string,
  ) {
    await this.commandBus.execute(
      new DeleteAddonConfigCommand(id, req.user.sub),
    );
  }
}
