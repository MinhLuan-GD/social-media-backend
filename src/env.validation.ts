import { plainToInstance } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsString,
  validateSync,
} from 'class-validator';

enum Environment {
  Development_Docker = 'docker.dev',
  Production_Docker = 'docker.prod',
  Development_Local = 'local.dev',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsInt()
  PORT: number;

  @IsString()
  BACK_END_URL: string;

  @IsString()
  FONT_END_URL: string;

  @IsString()
  DB_HOST: string;

  @IsInt()
  DB_PORT: number;

  @IsString()
  DB_NAME: string;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  STORE_HOST: string;

  @IsInt()
  STORE_PORT: number;

  @IsString()
  STORE_PASSWORD: string;

  @IsString()
  SECRET_KEY: string;

  @IsString()
  EXPIRES_IN: string;

  @IsString()
  ALGORITHM: string;

  @IsString()
  ORIGIN: string;

  @IsEmail()
  EMAIL: string;

  @IsString()
  MAILING_ID: string;

  @IsString()
  MAILING_SECRET: string;

  @IsString()
  MAILING_REFRESH: string;

  @IsString()
  CLOUD_NAME: string;

  @IsString()
  CLOUD_API_KEY: string;

  @IsString()
  CLOUD_API_SECRET: string;
}

export const validate = (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
};