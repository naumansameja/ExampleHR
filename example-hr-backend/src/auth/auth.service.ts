import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

export type LoginResult = {
  access_token: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResult> {
    const sharedPassword = process.env.AUTH_SHARED_PASSWORD;
    if (sharedPassword === undefined || sharedPassword === '') {
      throw new InternalServerErrorException(
        'AUTH_SHARED_PASSWORD is not configured',
      );
    }

    if (dto.password !== sharedPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const access_token = await this.jwtService.signAsync({
      sub: user.id,
    });

    return { access_token };
  }
}
