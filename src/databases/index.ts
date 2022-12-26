import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';

export const mongoOpts: MongooseModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (config: ConfigService) => ({
    uri: `mongodb://${config.get('DB_HOST')}:27017`,
    dbName: config.get('DB_NAME'),
    auth: {
      username: config.get('DB_USERNAME'),
      password: config.get('DB_PASSWORD'),
    },
    maxPoolSize: 10,
    minPoolSize: 3,
    socketTimeoutMS: 12000,
    family: 4,
  }),
  inject: [ConfigService],
};
