import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { compareSync, hash } from 'bcrypt';
import { IAuthService } from './auth';
import { AuthUtil } from './auth.util';
import { CreateUserDto } from './dtos/CreateUser.dto';

@Injectable()
export class AuthService extends AuthUtil implements IAuthService {
  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findUserAndFollow(email);
    if (user && compareSync(pass, user.password)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async getToken(
    payload: any,
    expiresIn: string | number = process.env.EXPIRES_IN || '7d',
    secret: string = process.env.SECRET_KEY || 'secret',
  ) {
    return { token: this.jwtService.sign(payload, { expiresIn, secret }) };
  }

  async login(id: string, email: string) {
    const payload = { id, email };
    return this.getToken(payload);
  }

  async signup(input: CreateUserDto) {
    const findUser = await this.usersService.findUserAndFollow(input.email);
    if (findUser) throw new HttpException('conflict', HttpStatus.CONFLICT);
    const password = await hash(input.password, 10);
    const username = await this.gUsername(input.first_name + input.last_name);
    const user = await this.usersService.createUser({
      ...input,
      password,
      username,
    });
    const payload = { id: user._id };
    const { token: emailToken } = await this.getToken(payload, '10m');
    const url = `${process.env.FONT_END_URL}/activate/${emailToken}`;
    this.sendVerificationEmail(user.email, user.first_name, url);
    const { token } = await this.getToken(payload);
    const rs = {
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      picture: user.picture,
      following: user.following,
      verified: user.verified,
    };
    return { ...rs, token };
  }

  async activate(id: string, token: string) {
    const payload: any = this.jwtService.verify(token, {
      secret: process.env.SECRET_KEY,
    });

    if (id !== payload.id) {
      throw new HttpException(
        `You don't have the authorization to complete this operation.`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.usersService.findUser({ _id: id });
    if (user.verified) {
      throw new HttpException(
        `This email is already activated.`,
        HttpStatus.CONFLICT,
      );
    }

    await this.usersService.updateUser({ _id: id }, { verified: true }, {});
    return 'Account has been activated successfully.';
  }

  async sendVerification(id: string) {
    const user = await this.usersService.findUser({ _id: id });
    if (user.verified) {
      throw new HttpException(
        `This account is already activated.`,
        HttpStatus.CONFLICT,
      );
    }

    const payload = { id };
    const { token } = await this.getToken(payload, '10m');
    const url = `${process.env.FONT_END_URL}/activate/${token}`;
    this.sendVerificationEmail(user.email, user.first_name, url);

    return 'Email verification link has been sent to your email.';
  }

  async sendResetPasswordCode(email: string) {
    const user = await this.usersService.findUser({ email });
    const code = this.generateCode(5);
    await this.usersService.setCode(user._id, code, 120);
    this.sendResetCode(user.email, user.first_name, code);
    return 'Email reset code has been sent to your email';
  }

  async validateResetCode(email: string, code: string) {
    const user = await this.usersService.findUser({ email });
    if ((await this.usersService.getCode(user._id)) != code) {
      throw new HttpException(
        'Verification code is wrong..',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const payload = { id: user._id };
    return this.getToken(payload, '10m');
  }

  async changePassword(email: string, iPassword: string) {
    const password = await hash(iPassword, 10);
    await this.usersService.updateUser({ email }, { password }, {});
    return 'ok';
  }
}
