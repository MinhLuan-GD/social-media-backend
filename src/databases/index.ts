import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';
import * as autoPopulate from 'mongoose-autopopulate';

export const mongoOpts: MongooseModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (config: ConfigService) => ({
    uri: `mongodb://${config.get('DB_HOST')}:${config.get('DB_PORT')}`,
    dbName: config.get('DB_NAME'),
    auth: {
      username: config.get('DB_USERNAME'),
      password: config.get('DB_PASSWORD'),
    },
    maxPoolSize: config.get('DB_MAX_POOL_SIZE'),
    minPoolSize: config.get('DB_MIN_POOL_SIZE'),
    socketTimeoutMS: config.get('DB_SOCKET_TIMEOUT'),
    family: config.get('DB_FAMILY'),
    connectionFactory: (connection: any) => {
      connection.plugin(autoPopulate);
      return connection;
    },
  }),
  inject: [ConfigService],
};
