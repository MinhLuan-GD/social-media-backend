import { plainToInstance } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsString,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
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
  TOXICITY_URL: string;

  @IsString()
  DB_URI: string;

  @IsString()
  SECRET_KEY: string;

  @IsString()
  EXPIRES_IN: string;

  @IsString()
  ALGORITHM: string;

  @IsString()
  ORIGIN: string;

  @IsInt()
  THROTTLE_TTL: number;

  @IsInt()
  THROTTLE_LIMIT: number;

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
