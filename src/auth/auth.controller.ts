import { Routes, Services } from '@/utils/constants';
import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Inject,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { IAuthService } from './auth';
import { CreateUserDto } from './dtos/CreateUser.dto';
import {
  RequestWithUser,
  AuthPayload,
  AuthUser,
} from './interfaces/auth.interface';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@SkipThrottle()
@Controller(Routes.AUTH)
export class AuthController {
  constructor(@Inject(Services.AUTH) private authService: IAuthService) {}

  @SkipThrottle(false)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req: RequestWithUser,
  ): Promise<AuthUser & { token: string }> {
    const { _id, email }: AuthPayload = req.user;
    const { token } = await this.authService.login(_id, email);
    const {
      _id: id,
      first_name,
      last_name,
      username,
      picture,
      following,
      verified,
      theme,
    } = req.user;
    return {
      id,
      first_name,
      last_name,
      username,
      picture,
      following,
      verified,
      token,
      theme,
    };
  }

  @Post('signup')
  async signup(
    @Body() input: CreateUserDto,
  ): Promise<AuthUser & { token: string }> {
    return this.authService.signup(input);
  }

  @UseGuards(JwtAuthGuard)
  @Post('activate')
  async activate(
    @Request() req: RequestWithUser,
    @Body('token') token: string,
  ) {
    return this.authService.activate(req.user._id, token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('send-verification')
  async sendVerification(@Request() req: RequestWithUser) {
    return this.authService.sendVerification(req.user._id);
  }

  @Post('send-reset-password-code')
  async sendResetPasswordCode(@Body('email') email: string) {
    return this.authService.sendResetPasswordCode(email);
  }

  @Post('validate-reset-code')
  async validateResetCode(@Body() body: { email: string; code: string }) {
    const { email, code } = body;
    return this.authService.validateResetCode(email, code);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    return this.authService.changePassword(email, password);
  }
}
