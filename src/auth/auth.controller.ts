import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { CreateSignupDto } from './dto/signup.dto';
import {
  RequestWithUser,
  AuthPayload,
  AuthUser,
} from './interfaces/auth.interface';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@SkipThrottle()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
      verified,
    } = req.user;
    return { id, first_name, last_name, username, picture, verified, token };
  }

  @Post('signup')
  async signup(
    @Body() input: CreateSignupDto,
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

  @Post('change-password')
  async changePassword(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    return this.authService.changePassword(email, password);
  }
}
