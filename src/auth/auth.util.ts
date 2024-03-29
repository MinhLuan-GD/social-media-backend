import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { MailerService } from '@nestjs-modules/mailer';
import { MyLogger } from '@/logger/logger.service';
import { Inject, Injectable } from '@nestjs/common';
import { Services } from '@/utils/constants';
import { IUsersService } from '@/users/users';
import { GetAccessTokenResponse } from 'google-auth-library/build/src/auth/oauth2client';

@Injectable()
export class AuthUtil {
  constructor(
    @Inject(Services.USERS) public usersService: IUsersService,
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
      if (await this.usersService.findUser({ username }))
        username = this.makeId(baseUsername);
      else return username;
  }

  async sendVerificationEmail(email: string, name: string, url: string) {
    let myAccessTokenObject: GetAccessTokenResponse | undefined;
    try {
      myAccessTokenObject = await this.myOAuth2Client.getAccessToken();
    } catch (error) {
      this.logger.error(error);
      return;
    }

    const myAccessToken = myAccessTokenObject.token;
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
    this.mailerService.sendMail(mailOptions);
  }

  async sendResetCode(email: string, name: string, code: string) {
    let myAccessTokenObject: GetAccessTokenResponse | undefined;
    try {
      myAccessTokenObject = await this.myOAuth2Client.getAccessToken();
    } catch (error) {
      this.logger.error(error);
      return;
    }

    const myAccessToken = myAccessTokenObject.token;
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
    this.mailerService.sendMail(mailOptions);
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
