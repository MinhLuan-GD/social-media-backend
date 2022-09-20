import { UsersService } from '@users/users.service';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { MailerService } from '@nestjs-modules/mailer';
import { MyLogger } from '@logger/logger.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthUtil {
  constructor(
    public usersService: UsersService,
    public jwtService: JwtService,
    private mailerService: MailerService,
  ) {
    this.myOAuth2Client.setCredentials({
      refresh_token: process.env.MAILING_REFRESH,
    });
  }

  private rexa = /[áàảãạăắằẳẵặâấầẩẫậ]/gi;
  private rexe = /[éèẻẽẹêếềểễệ]/gi;
  private rexi = /[íìỉĩị]/gi;
  private rexu = /[úùủũụưứừửữự]/gi;
  private rexo = /[óòỏõọôốồổỗộơớờởỡợ]/gi;
  private c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  private cLen = this.c.length;
  private schema = '0123456789';
  private logger = new MyLogger();
  private myOAuth2Client = new OAuth2Client(
    process.env.MAILING_ID,
    process.env.MAILING_SECRET,
  );

  async gUsername(username: string) {
    const baseUsername = this.convert(username);
    username = this.makeId(baseUsername);
    while (true)
      if (await this.usersService.findByUsername(username))
        username = this.makeId(baseUsername);
      else return username;
  }

  async sendVerificationEmail(email: string, name: string, url: string) {
    const myAccessTokenObject = await this.myOAuth2Client.getAccessToken();
    const myAccessToken = myAccessTokenObject?.token;
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Email verification',
      template: './confirmation',
      context: { name, url },
      auth: {
        refreshToken: process.env.MAILING_REFRESH,
        accessToken: myAccessToken,
      },
    };
    this.mailerService
      .sendMail(mailOptions)
      .then((val) => val)
      .catch((res) => this.logger.error(res));
  }

  async sendResetCode(email: string, name: string, code: string) {
    const myAccessTokenObject = await this.myOAuth2Client.getAccessToken();
    const myAccessToken = myAccessTokenObject?.token;
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Email reset password',
      template: './resetPass',
      context: { name, code },
      auth: {
        refreshToken: process.env.MAILING_REFRESH,
        accessToken: myAccessToken,
      },
    };
    this.mailerService
      .sendMail(mailOptions)
      .then((val) => val)
      .catch((res) => this.logger.error(res));
  }

  generateCode(length: number) {
    let code = '';
    for (let i = 0; i < length; i++)
      code += this.schema.charAt(
        Math.floor(Math.random() * this.schema.length),
      );

    return code;
  }

  private makeId(username: string) {
    username += '_';
    for (let i = 0; i < 9; i++)
      username += this.c.charAt(Math.floor(Math.random() * this.cLen));
    return username;
  }

  private convert = (text: string) =>
    text
      .replace(this.rexa, 'a')
      .replace(this.rexe, 'e')
      .replace(this.rexo, 'o')
      .replace(this.rexi, 'i')
      .replace(this.rexu, 'u');
}
