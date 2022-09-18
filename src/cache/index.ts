import { CacheModuleAsyncOptions } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

const userCacheOpts: CacheModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (config: ConfigService) => ({
    store: redisStore,
    host: config.get('STORE_HOST'),
    port: config.get('STORE_PORT'),
    password: config.get('STORE_PASSWORD'),
  }),
  inject: [ConfigService],
};

export { userCacheOpts };
