import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>
  ) { }
  async create(createUserDto: CreateUserDto) {
    const { roleId, password, ...userData } = createUserDto;
    const role = await this.findRoleOrThrow(roleId);

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
      role
    });
    // Guarda y retorna el usuario sin la contraseña
    const saveUser = await this.usersRepository.save(user);
    return await this.usersRepository.findOneBy({
      id: saveUser.id
    })
  }

  async findAll() {
    return this.usersRepository.find({
      where: { isActive: true, role: { isActive: true } }
    });
  }

  async findOne(id: string) {
    const userExist = await this.usersRepository.findOne({
      where: { id }
    });

    if (!userExist) {
      return new NotFoundException(`user con el id ${id} no encontrado`);
    }

    if (!userExist.isActive) {
      return new BadRequestException(`el user con el id ${id} se encuentra desavilitado`);
    }

    return userExist;

  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userExist = await this.usersRepository.findOne({
      where: { id }
    });

    if (!userExist) {
      return new NotFoundException(`el usuario con el id ${id} no se encuentra`);
    }
    const { password, roleId, ...userData } = updateUserDto;

    //En caso de que mande otra contraseña
    let updatePassword: string | undefined;
    if (password) {
      updatePassword = await bcrypt.hash(password, 12);
    }

    //Cambia el rol
    let rol: Role | undefined
    if (roleId) {
      rol = await this.findRoleOrThrow(roleId);
    }

    const user = await this.usersRepository.preload({
      id,
      ...userData,
      ...(updatePassword && { password: updatePassword }),
      ...(rol && { role: rol }),
    });

    if (!user) {
      throw new NotFoundException(`No se pudo cargar el usuario con id ${id} para actualizar sus datos`);
    }
    await this.usersRepository.save(user);

    const updateUser = await this.usersRepository.findOneBy({ id })

    return updateUser;
  }

  async remove(id: string) {
    const user = await this.findOne(id) as User;
    await this.usersRepository.update(id, {isActive: false});
    return{
      message: `usuario (${user.firstName}) a sido desavilitado correctamente`
    }    
  }

  private async findRoleOrThrow(roleId: string) {
    const role = await this.roleRepository.findOneBy({
      id: roleId,
      isActive: true,
    })
    if (!role) {
      throw new NotFoundException(
        `Role with ID ${roleId} not found or inactive`,
      );
    }
    return role;
  }
}
