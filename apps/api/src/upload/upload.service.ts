import { Injectable } from '@nestjs/common';
import { buildStaticFileUrl } from './upload.utils';

@Injectable()
export class UploadService {
  getFileUrl(
    host: string,
    folder: 'avatars' | 'portfolio',
    filename: string,
  ): string {
    return buildStaticFileUrl(host, folder, filename);
  }
}
