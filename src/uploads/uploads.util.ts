import { PathLike, unlink } from 'fs';

export class UploadUtil {
  removeTmp(path: PathLike) {
    unlink(path, (err) => {
      if (err) throw err;
    });
  }
}
