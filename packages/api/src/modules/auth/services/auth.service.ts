import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import {
  LoginDto,
  OauthLoginDto,
  RegisterDto,
  TokenResponseDto,
} from '../dtos';
import {
  AddOAuthProviderCommand,
  GetUserByEmailQuery,
  GetUserByOauthQuery,
  RegisterUserCommand,
  RegisterUserWithOAuthCommand,
} from '../../users/application';
import { PasswordHasher } from '../../shared/domain/services/password-hasher';

@Injectable()
export class AuthService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly jwtService: JwtService,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  public async register(dto: RegisterDto): Promise<TokenResponseDto> {
    const res = await this.commandBus.execute(
      new RegisterUserCommand({
        email: dto.email,
        password: dto.password,
        displayName: dto.displayName,
      }),
    );

    const jwt = this.signJwt({
      id: res.id,
      email: res.email,
    });

    return new TokenResponseDto(jwt);
  }

  public async login(dto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.queryBus.execute(
      new GetUserByEmailQuery(dto.email),
    );

    if (!user) throw new UnauthorizedException('Invalid credentials.');

    const isValid = await this.passwordHasher.verify(
      user.passwordHash!,
      dto.password,
    );

    if (!isValid) throw new UnauthorizedException('Invalid credentials.');

    const token = this.signJwt({
      id: user.id,
      email: user.email,
    });

    return new TokenResponseDto(token);
  }

  public async loginOrCreateOAuthUser(
    dto: OauthLoginDto,
  ): Promise<TokenResponseDto> {
    let user = await this.queryBus.execute(
      new GetUserByOauthQuery(dto.provider, dto.providerId),
    );

    if (user) {
      return new TokenResponseDto(this.signJwt(user!));
    }

    if (dto.email) {
      user = await this.queryBus.execute(new GetUserByEmailQuery(dto.email));

      if (user) {
        await this.commandBus.execute(
          new AddOAuthProviderCommand(user.id, {
            provider: dto.provider,
            providerId: dto.providerId,
          }),
        );

        return new TokenResponseDto(this.signJwt(user!));
      }
    }

    user = await this.commandBus.execute(
      new RegisterUserWithOAuthCommand(dto.email, dto.displayName, [
        {
          provider: dto.provider,
          providerId: dto.providerId,
        },
      ]),
    );

    return new TokenResponseDto(this.signJwt(user!));
  }

  private signJwt(user: { id: string; email: string | null }): string {
    return this.jwtService.sign({ sub: user.id, email: user.email });
  }
}
