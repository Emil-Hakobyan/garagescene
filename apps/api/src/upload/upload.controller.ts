import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import {
  avatarFileFilter,
  createFilename,
  ensureUploadDirectory,
  portfolioFileFilter,
} from './upload.utils';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          callback(null, ensureUploadDirectory('uploads/avatars'));
        },
        filename: (_req, file, callback) => {
          callback(null, createFilename(file.originalname));
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: avatarFileFilter,
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a profile avatar image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({
    description: 'Avatar uploaded successfully',
    schema: {
      example: {
        url: 'http://localhost:3001/static/avatars/abc123.jpg',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { protocol: string; get(name: string): string | undefined },
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const host = `${req.protocol}://${req.get('host')}`;

    return {
      url: this.uploadService.getFileUrl(host, 'avatars', file.filename),
    };
  }

  @Post('portfolio')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          callback(null, ensureUploadDirectory('uploads/portfolio'));
        },
        filename: (_req, file, callback) => {
          callback(null, createFilename(file.originalname));
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 },
      fileFilter: portfolioFileFilter,
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a portfolio image or video file' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({
    description: 'Portfolio file uploaded successfully',
    schema: {
      example: {
        url: 'http://localhost:3001/static/portfolio/abc123.mp4',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  uploadPortfolio(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { protocol: string; get(name: string): string | undefined },
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const host = `${req.protocol}://${req.get('host')}`;

    return {
      url: this.uploadService.getFileUrl(host, 'portfolio', file.filename),
    };
  }
}
