import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category)
  private readonly categoryRepository: Repository<Category>) {

  }
  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async findAll() {
    return await this.categoryRepository.find({
      relations: { products: true },
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: { products: true },
    });
    if (!category) {
      return new NotFoundException(`category with id ${id} not found`);
    }
    return category;
  }


  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    //verifica si existe la categoria y si esta activo
    await this.findOne(id);

    const category = await this.categoryRepository.preload({
      id,
      ...updateCategoryDto
    })
    return await this.categoryRepository.save(category!);
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    await this.categoryRepository.update(id, { isActive: false });

    return { message: `category (${category.name}) desative successfully` }
  }
}
