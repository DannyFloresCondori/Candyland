import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { promises } from 'dns';
import { ProductImage } from './entities/product-image.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(ProductImage)
    private readonly producImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) { }
  async create(createProductDto: CreateProductDto) {
    const { categoryId, images = [], ...producData } = createProductDto;
    const category = await this.findCategoryOrThrow(categoryId)



    const product = this.productRepository.create({
      ...producData,
      category,
      images: images.map((url) => this.producImageRepository.create({ url })),
    })
    return this.productRepository.save(product)
  }

  async findAll(PaginationDto: PaginationDto) {
    const { page = 1, limit = 4 } = PaginationDto;
    const offset = (page - 1) * limit;
    
    const [products, total] = await this.productRepository.findAndCount({
      where: { isActive: true, category: { isActive: true } },
      relations: ['category', 'images'], // 🔹 Aquí agregamos category
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      }
    };
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: {
        id, isActive: true, category: { isActive: true }
      },
      relations: ['category', 'images'], // 🔹 Aquí agregamos category
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { categoryId, images, ...productData } = updateProductDto;

    // verifica si el producto existe y si esta activo.
    await this.findOne(id);

    const product = await this.productRepository.preload({
      id, ...productData
    })
    //verifica sila categoria existe para poder actualizar 
    if (categoryId) {
      product!.category = await this.findCategoryOrThrow(categoryId);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction();

    try {
      if (images) {
        // Elimina las imagenes existentes
        await queryRunner.manager.delete(ProductImage, { product: { id } });

        // Crea nuevas imagenes y las asignos al producto
        product!.images = images.map((url) => this.producImageRepository.create({ url }),);
      }
      //guarda e prodcuto actualizado 
      await queryRunner.manager.save(Product, product!);
      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id)
    await this.productRepository.update(
      id, { isActive: false }
    );
    return {
      message: `product (${product.name}) has been deactivated`
    }
  }

  private async findCategoryOrThrow(categoryId: string): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({
      id: categoryId,
      isActive: true,
    })

    if (!category) {
      throw new NotFoundException(`this whit id ${categoryId} not found`)
    }
    return category;
  }

  // src/products/products.service.ts
  async findByCategory(categoryId: string) {
    return await this.productRepository.find({
      where: { category: { id: categoryId }, isActive: true, },

      relations: ['category', 'images'], // 🔹 Aquí agregamos category
    });
  }


}
