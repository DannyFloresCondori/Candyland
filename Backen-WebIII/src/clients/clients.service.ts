import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';


@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) { }
  async create(createClientDto: CreateClientDto) {
    const { password, ...userData } = createClientDto;

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = this.clientRepository.create({
      ...userData,
      password: hashedPassword
    })

    const saveUser = await this.clientRepository.save(user)
    return await this.clientRepository.findOneBy({
      id: saveUser.id
    })
  }

  async findAll() {
    return this.clientRepository.find()
  }

  async findOne(id: string) {
    const existClient = await this.clientRepository.findOne({
      where: { id },
      relations: ['ecommerces', 'ecommerces.ecommerceDetail', 'ecommerces.ecommerceDetail.product']
    });

    if (!existClient) {
      return new NotFoundException(`cliente con el id ${id} no encontrado`);
    }

    if (!existClient.isActive) {
      throw new BadRequestException(`El cliente con ID ${id} no está activo`);
    }

    return existClient
  }

  async update(id: string, updateClientDto: UpdateClientDto) {

    const existClient = await this.clientRepository.findOne({
      where: { id }
    });

    if (!existClient) {
      return new NotFoundException(`cliente con el id ${id} no encontrado`);
    }

    const { password, ...clientData } = updateClientDto;
    let updatePassword: string | undefined;
    if (password) {
      updatePassword = await bcrypt.hash(password, 12);
    }

    const client = await this.clientRepository.preload({
      id, ...clientData,
      ...(updatePassword && { password: updatePassword }),
    })

    return await this.clientRepository.save(client!);

  }

  async remove(id: string) {
    const client = await this.findOne(id) as Client;
    await this.clientRepository.update(id, { isActive: false });

    return {message: `client (${client.firstName}) se desavilito correctamente`}
  }
}
