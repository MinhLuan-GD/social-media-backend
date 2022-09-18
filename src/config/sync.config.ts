import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigOptions as CloudinaryOptions } from 'cloudinary';
import { CompressionOptions } from 'compression';

const cloudinaryOpts: CloudinaryOptions = {
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
};

const compressionOpts: CompressionOptions = {
  level: 6,
  threshold: 40000,
};

const corsOpts: CorsOptions = { origin: process.env.ORIGIN };

export { cloudinaryOpts, compressionOpts, corsOpts };
