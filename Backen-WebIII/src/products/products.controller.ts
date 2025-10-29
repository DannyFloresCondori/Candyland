import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FilesService } from 'src/files/files.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService,
    private readonly filesService: FilesService
  ) { }
  @Post()
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let imageUrls: string[] = [];
    // Si se enviaron archivos multipart, subirlos y usar sus URLs
    if (files && files.length > 0) {
      imageUrls = await this.filesService.uploadMultipleFiles(files);
    } else if ((createProductDto as any).images && Array.isArray((createProductDto as any).images)) {
      // Si no hay archivos, permitir que el cliente envíe las URLs en el body (string[])
      const imgs = (createProductDto as any).images;
      // Normalizar en caso de que vengan como { url: string }
      if (imgs.length > 0 && typeof imgs[0] === 'object' && imgs[0] !== null && 'url' in imgs[0]) {
        imageUrls = imgs.map((i: any) => i.url).filter(Boolean);
      } else {
        imageUrls = imgs.filter((i: any) => typeof i === 'string');
      }
    }
    return this.productsService.create({
      ...createProductDto,
      images: imageUrls, // usar las URLs determinadas
    });
  }


  @Get()
  findAll(@Query() PaginationDto: PaginationDto) {
    return this.productsService.findAll(PaginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10))
  async update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let imageUrls: string[] | undefined = undefined;
    // Si hay archivos nuevos, subirlos y reemplazar imágenes
    if (files && files.length > 0) {
      imageUrls = await this.filesService.uploadMultipleFiles(files);
    } else if ((updateProductDto as any).images && Array.isArray((updateProductDto as any).images)) {
      // Si el cliente envía imágenes en el body (por ejemplo después de subir a /files), usarlas
      const imgs = (updateProductDto as any).images;
      if (imgs.length > 0 && typeof imgs[0] === 'object' && imgs[0] !== null && 'url' in imgs[0]) {
        imageUrls = imgs.map((i: any) => i.url).filter(Boolean);
      } else {
        imageUrls = imgs.filter((i: any) => typeof i === 'string');
      }
    }
    return this.productsService.update(id, {
      ...updateProductDto,
      images: imageUrls && imageUrls.length > 0 ? imageUrls : undefined,
    });
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }

  // src/products/products.controller.ts
  @Get('category/:id')
  findByCategory(@Param('id') id: string) {
    return this.productsService.findByCategory(id);
  }

}
