import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Res,
  UsePipes,
  ValidationPipe,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { ConfigService } from '@nestjs/config';
import {
  commonCookieOptions,
  httpOnlyCookieOptions,
} from 'src/utils/cookieOptions';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('register')
  @UsePipes(new ValidationPipe())
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res,
  ) {
    const { accessToken, refreshToken, message } =
      await this.authService.register(createUserDto);
    res.cookie('refresh_token', refreshToken, httpOnlyCookieOptions);
    res.cookie('access_token', accessToken, commonCookieOptions);
    res.cookie('logged_in', true, commonCookieOptions);
    return { message };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res) {
    const { accessToken, refreshToken, message } = await this.authService.login(
      req,
    );
    res.cookie('refresh_token', refreshToken, httpOnlyCookieOptions);
    res.cookie('access_token', accessToken, commonCookieOptions);
    res.cookie('logged_in', true, commonCookieOptions);
    return { message };
  }

  @Post('refresh')
  async refresh(@Request() req, @Res({ passthrough: true }) res) {
    const { accessToken } = await this.authService.refreshToken(req);
    res.cookie('access_token', accessToken, commonCookieOptions);
    res.cookie('logged_in', true, commonCookieOptions);

    return { status: 'OK' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const accessToken = req.cookies.access_token;

    if (!accessToken) throw new UnauthorizedException();
    const user = await this.authService.getUserByToken(accessToken);

    return { id: user['id'], email: user['email'], username: user['username'] };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res) {
    return this.authService.logout(res);
  }
}
