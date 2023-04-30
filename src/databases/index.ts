import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';
import * as autoPopulate from 'mongoose-autopopulate';

export const mongoOpts: MongooseModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (config: ConfigService) => ({
    uri: config.get('DB_URI'),
    connectionFactory: (connection: any) => {
      connection.plugin(autoPopulate);
      return connection;
    },
  }),
  inject: [ConfigService],
};
