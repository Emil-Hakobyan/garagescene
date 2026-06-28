import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { extname } from 'path';

const AVATAR_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const PORTFOLIO_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

export function ensureUploadDirectory(directory: string): string {
  const uploadPath = `${process.cwd()}/${directory}`;

  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
  }

  return uploadPath;
}

export function createFilename(originalName: string): string {
  return `${randomUUID()}${extname(originalName).toLowerCase()}`;
}

export function avatarFileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
): void {
  if (!AVATAR_MIME_TYPES.has(file.mimetype)) {
    callback(
      new BadRequestException('Only JPG, PNG, and WEBP images are allowed'),
      false,
    );
    return;
  }

  callback(null, true);
}

export function portfolioFileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
): void {
  if (!PORTFOLIO_MIME_TYPES.has(file.mimetype)) {
    callback(
      new BadRequestException('Only image or video files are allowed'),
      false,
    );
    return;
  }

  callback(null, true);
}

export function buildStaticFileUrl(
  host: string,
  folder: 'avatars' | 'portfolio',
  filename: string,
): string {
  return `${host}/static/${folder}/${filename}`;
}
