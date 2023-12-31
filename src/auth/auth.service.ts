import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { EAuth } from 'src/types';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { User } from 'src/users/entity/user.entity';

import { UsersService } from 'src/users/users.service';
import { commonCookieOptions } from 'src/utils/cookieOptions';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async findUser(id: number) {
    const user = await this.usersService.findOneById(id);
    return user;
  }

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findOneByEmail(email);

    const isComparedPassword = await compare(pass, user.password);

    if (user && isComparedPassword) {
      const { password, ...rest } = user;

      return rest;
    }
    return null;
  }

  async register(createUserDto: CreateUserDto) {
    await this.usersService.createUser(createUserDto);

    const user = await this.usersService.findOneByEmail(createUserDto.email);
    const { id, username, email } = user;
    const payload = {
      email,
      id,
      username,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '30m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return { accessToken, refreshToken, message: EAuth.REGISTER_SUCCESS };
  }

  async login(request) {
    const user = await this.usersService.findOneByEmail(request.user.email);

    const { id, username, email } = user;
    const payload = {
      email,
      id,
      username,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '30m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return { accessToken, refreshToken, message: EAuth.LOGIN_SUCCESS };
  }

  logout(res) {
    res.clearCookie('refresh_token');
    res.clearCookie('access_token');
    res.cookie('logged_in', false, commonCookieOptions);

    return {
      message: EAuth.LOGOUT_SUCCESS,
    };
  }

  async getUserByToken(accessToken) {
    try {
      const user = this.jwtService.decode(
        accessToken,
        this.configService.get('JWT_SECRET'),
      );
      return user;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async refreshToken(req) {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) throw new UnauthorizedException();
    try {
      this.jwtService.verify(
        refreshToken,
        this.configService.get('JWT_SECRET'),
      );
    } catch (error) {
      throw new UnauthorizedException();
    }
    const user = this.jwtService.decode(
      refreshToken,
      this.configService.get('JWT_SECRET'),
    );

    if (typeof user === 'object' && user !== null) {
      const { id, username, email } = user as Partial<User>;
      const payload = {
        email,
        id,
        username,
      };
      const accessToken = this.jwtService.sign(payload, { expiresIn: '30m' });
      return { accessToken };
    }
  }
}
