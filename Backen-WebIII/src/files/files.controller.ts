import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      const fileUrl = await this.filesService.uploadFile(file);
      return {
        success: true,
        url: fileUrl,
        message: 'Archivo subido exitosamente',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10)) // Máximo 10 archivos
  async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    try {
      const fileUrls = await this.filesService.uploadMultipleFiles(files);
      return {
        success: true,
        urls: fileUrls,
        message: `${fileUrls.length} archivo(s) subido(s) exitosamente`,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
