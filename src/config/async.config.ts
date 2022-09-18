import { validate } from '@/env.validation';
import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface';
import {
  ConfigModule,
  ConfigModuleOptions,
  ConfigService,
} from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';

const URL_D_PIC =
  'https://res.cloudinary.com/same-cloud/image/upload/v1662905666/d_pic_o44tju.png';

const configOpts: ConfigModuleOptions = {
  envFilePath: `${process.env.NODE_ENV}.env`,
  validate,
};

const jwtOpts: JwtModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (config: ConfigService) => ({
    secret: config.get('SECRET_KEY'),
    signOptions: {
      expiresIn: config.get('EXPIRES_IN'),
      algorithm: config.get('ALGORITHM'),
    },
  }),
  inject: [ConfigService],
};

const mailOpts: MailerAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (config: ConfigService) => ({
    transport: {
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: config.get('EMAIL'),
        clientId: config.get('MAILING_ID'),
        clientSecret: config.get('MAILING_SECRET'),
      },
    },
  }),
  inject: [ConfigService],
};

export { configOpts, jwtOpts, mailOpts, URL_D_PIC };