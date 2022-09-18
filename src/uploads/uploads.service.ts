import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UploadUtil } from './uploads.util';
import { v2 } from 'cloudinary';

@Injectable()
export class UploadsService {
  constructor(private uploadUtil: UploadUtil) {}

  async uploadToCloud(
    file: Express.Multer.File,
    path: string,
  ): Promise<{ url: string }> {
    return new Promise((resolve) => {
      v2.uploader.upload(
        file.path,
        { folder: `facebook-clone/${path}` },
        (err, res) => {
          if (err) {
            this.uploadUtil.removeTmp(file.path);
            throw new HttpException(
              'Upload image failed.',
              HttpStatus.CONFLICT,
            );
          }
          resolve({ url: res.secure_url });
        },
      );
    });
  }

  async listImages(path: string, sort: 'asc' | 'desc', max: number) {
    return v2.search
      .expression(`facebook-clone/${path}`)
      .sort_by('created_at', `${sort}`)
      .max_results(max)
      .execute()
      .then((result) => result)
      .catch((err) => {
        throw new HttpException(err.error.message, HttpStatus.CONFLICT);
      });
  }
}
