import { Controller, Get, Redirect } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @Redirect()
  configure() {
    const url = this.configService.get<string>(
      'CONFIGURE_URL',
      'http://localhost:4200',
    );
    return { url, statusCode: 302 };
  }
}
