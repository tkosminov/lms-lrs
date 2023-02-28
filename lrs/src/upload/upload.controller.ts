import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { bad_request } from '../errors';

import { IFile, UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post()
  public async upload(@UploadedFile() file: IFile) {
    if (file.mimetype !== 'application/zip') {
      bad_request({ raise: true });
    }

    return {
      hash_sum: await this.uploadService.upload(file),
    };
  }
}
