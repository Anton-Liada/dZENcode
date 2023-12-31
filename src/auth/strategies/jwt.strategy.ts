import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entity/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(user: User) {
    try {
      const existUser = await this.usersService.findOneById(+user.id);

      if (!existUser) {
        throw new UnauthorizedException();
      }

      return { id: user.id, email: user.email, username: user.username };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
