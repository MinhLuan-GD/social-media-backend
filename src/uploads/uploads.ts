export interface IUploadsService {
  uploadToCloud(file: Express.Multer.File, path: string): Promise<any>;

  listImages(path: string, sort: 'asc' | 'desc', max: number): Promise<any>;
}
