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
    connectionFactory: (connection: any) => {
      connection.plugin(autoPopulate);
      return connection;
    },
  }),
  inject: [ConfigService],
};
