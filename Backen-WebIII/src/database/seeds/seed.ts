import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { User } from '../../users/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';
import { Category } from '../../categories/entities/category.entity';
import { Product } from '../../products/entities/product.entity';

import { AppDataSource } from '../data-resource';

import { CreateRoleDto } from '../../roles/dto/create-role.dto';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { CreateCategoryDto } from '../../categories/dto/create-category.dto';
import { CreateProductDto } from '../../products/dto/create-product.dto';

(async () => {
  const dataSource: DataSource = await AppDataSource.initialize();
  console.log('📦 Conectado a la base de datos...');

  try {
    // ========== 1️⃣ ROLES ==========
    const roleRepo = dataSource.getRepository(Role);
    const rolesData: CreateRoleDto[] = [
      { name: 'Administrador', description: 'Acceso total al sistema' },
      { name: 'Cocinero', description: 'Gestiona productos y pedidos' },
      { name: 'Cliente', description: 'Realiza pedidos y consulta productos' },
    ];

    for (const data of rolesData) {
      const dto = plainToInstance(CreateRoleDto, data);
      await validateOrReject(dto);
    }

    const roles = roleRepo.create(rolesData);
    await roleRepo.save(roles);
    console.log('✅ Roles creados');

    const adminRole = roles.find(r => r.name === 'administrador');
    const cookRole = roles.find(r => r.name === 'cocinero');
    const clientRole = roles.find(r => r.name === 'cliente');

    // ========== 2️⃣ USUARIOS ==========
    const userRepo = dataSource.getRepository(User);
    const passwordHash = async (password: string) => await bcrypt.hash(password, 10);

    const usersData: CreateUserDto[] = [
      {
        email: 'admin@reposteria.com',
        password: await passwordHash('Admin123!'),
        firstName: 'Lucía',
        lastName: 'Dulce',
        documentNumber: '12345678',
        address: 'Av. Pastelera 123',
        roleId: adminRole!.id,
      },
      {
        email: 'cook1@reposteria.com',
        password: await passwordHash('Cook123!'),
        firstName: 'Cocinero1',
        lastName: 'Merengue',
        documentNumber: 'CK001',
        address: 'Calle Sabor #1',
        roleId: cookRole!.id,
      },
      {
        email: 'cook2@reposteria.com',
        password: await passwordHash('Cook123!'),
        firstName: 'Cocinero2',
        lastName: 'Merengue',
        documentNumber: 'CK002',
        address: 'Calle Sabor #2',
        roleId: cookRole!.id,
      },
      {
        email: 'cliente1@reposteria.com',
        password: await passwordHash('Cliente123!'),
        firstName: 'Cliente1',
        lastName: 'Dulzón',
        documentNumber: 'CL001',
        address: 'Barrio Dulce #1',
        roleId: clientRole!.id,
      },
      {
        email: 'cliente2@reposteria.com',
        password: await passwordHash('Cliente123!'),
        firstName: 'Cliente2',
        lastName: 'Dulzón',
        documentNumber: 'CL002',
        address: 'Barrio Dulce #2',
        roleId: clientRole!.id,
      },
    ];

    for (const data of usersData) {
      const dto = plainToInstance(CreateUserDto, data);
      await validateOrReject(dto);
    }

    const users = userRepo.create(usersData);
    await userRepo.save(users);
    console.log('✅ Usuarios creados');

    // ========== 3️⃣ CATEGORÍAS ==========
    const categoryRepo = dataSource.getRepository(Category);
    const categoriesData: CreateCategoryDto[] = [
      { name: 'Tortas', description: 'Tortas decoradas y personalizadas' },
      { name: 'Cupcakes', description: 'Mini pastelitos decorados' },
      { name: 'Galletas', description: 'Galletas artesanales y decoradas' },
    ];

    for (const data of categoriesData) {
      const dto = plainToInstance(CreateCategoryDto, data);
      await validateOrReject(dto);
    }

    const categories = categoryRepo.create(categoriesData);
    await categoryRepo.save(categories);
    console.log('✅ Categorías creadas');

    // ========== 4️⃣ PRODUCTOS ==========
    const productRepo = dataSource.getRepository(Product);
    const productosData: CreateProductDto[] = [
      { name: 'Torta de Chocolate', price: 45, stock: 10, categoryId: categories[0].id },
      { name: 'Torta Red Velvet', price: 50, stock: 8, categoryId: categories[0].id },
      { name: 'Cupcake Vainilla x6', price: 20, stock: 15, categoryId: categories[1].id },
      { name: 'Cupcake Chocolate x6', price: 22, stock: 12, categoryId: categories[1].id },
      { name: 'Galletas Decoradas x10', price: 18, stock: 20, categoryId: categories[2].id },
      { name: 'Galletas de Mantequilla', price: 15, stock: 25, categoryId: categories[2].id },
    ];

    for (const data of productosData) {
      const dto = plainToInstance(CreateProductDto, data);
      await validateOrReject(dto);
    }

    // const productos = productRepo.create(productosData);
    // await productRepo.save(productos);
    console.log('✅ Productos creados');

    console.log('🎉 SEED COMPLETADO CON VALIDACIÓN DTOs');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando el seed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
})();
