import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEcommerceDto } from './dto/create-ecommerce.dto';
import { UpdateEcommerceDto } from './dto/update-ecommerce.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ecommerce } from './entities/ecommerce.entity';
import { Repository } from 'typeorm';
import { ecommerceDetail } from './entities/ecommerceDetail.entity';
import { Product } from 'src/products/entities/product.entity';
import { Client } from 'src/clients/entities/client.entity';

@Injectable()
export class EcommerceService {
  constructor(
    @InjectRepository(Ecommerce)
    private readonly ecommerceRepository: Repository<Ecommerce>,
    @InjectRepository(ecommerceDetail)
    private readonly ecommerceDetailRepository: Repository<ecommerceDetail>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createEcommerceDto: CreateEcommerceDto) {
    const { clientId, nameClient, nameCompany, status = 'Pendiente', total, userId, ecommerceDetail } = createEcommerceDto;

    const ecommerce = this.ecommerceRepository.create({
      client: { id: clientId } as any,
      nameClient,
      nameCompany,
      status,
      total: 0,
      users: { id: userId } as any,
    });
    const savedEcommerce = await this.ecommerceRepository.save(ecommerce);

    let totalEcommerce = 0;
    const detailsToSave: ecommerceDetail[] = [];

    for (const detail of ecommerceDetail) {
      const product = await this.ecommerceDetailRepository.manager.findOne(Product, {
        where: { id: detail.productId },
        relations: ['images'], // ✅ Trae también las imágenes del producto
      });
      if (!product) throw new NotFoundException(`Producto con el id ${detail.productId} no existe`);

      const unitPrice = product.price;
      const subTotal = unitPrice * detail.quantity;
      totalEcommerce += subTotal;

      const newDetail = this.ecommerceDetailRepository.create({
        ecommerce: savedEcommerce,
        product,
        quantity: detail.quantity,
        unitPrice,
        subTotal,
      });
      detailsToSave.push(newDetail);

      product.stock -= detail.quantity;
      await this.ecommerceDetailRepository.manager.save(product);
    }

    const savedDetails = await this.ecommerceDetailRepository.save(detailsToSave);
    savedEcommerce.total = totalEcommerce;
    savedEcommerce.ecommerceDetail = savedDetails;
    await this.ecommerceRepository.save(savedEcommerce);

    return savedEcommerce;
  }

  async findAll() {
    return await this.ecommerceRepository.find({
      where: [
        { status: 'Pendiente' },
        { status: 'Vendido' },
        { status: 'Rechazado' },
      ],
      relations: [
        'ecommerceDetail',
        'ecommerceDetail.product',
        'ecommerceDetail.product.images', // ✅ Incluye imágenes
        'client',
        'users',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const ecommerce = await this.ecommerceRepository.findOne({
      where: [
        { id, status: 'Pendiente' },
        { id, status: 'Vendido' },
        { id, status: 'Rechazado' },
      ],
      relations: [
        'ecommerceDetail',
        'ecommerceDetail.product',
        'ecommerceDetail.product.images', // ✅ Incluye imágenes también aquí
        'client',
        'users',
      ],
    });
    if (!ecommerce) throw new NotFoundException(`Ecommerce con el id ${id} no encontrado`);
    return ecommerce;
  }

  async update(orderId: string, updateEcommerceDto: UpdateEcommerceDto) {
    const { clientId, nameClient, nameCompany, status, ecommerceDetail } = updateEcommerceDto;

    const ecommerce = await this.ecommerceRepository.findOne({
      where: { id: orderId },
      relations: ['ecommerceDetail', 'ecommerceDetail.product', 'client', 'users'],
    });

    if (!ecommerce) throw new NotFoundException(`Pedido con id ${orderId} no existe`);

    if (clientId) ecommerce.client = { id: clientId } as any;
    if (nameClient) ecommerce.nameClient = nameClient;
    if (nameCompany !== undefined) ecommerce.nameCompany = nameCompany;
    if (status) ecommerce.status = status;

    if (ecommerceDetail && ecommerceDetail.length > 0) {
      let totalEcommerce = 0;

      for (const oldDetail of ecommerce.ecommerceDetail) {
        const product = await this.ecommerceDetailRepository.manager.findOne(Product, {
          where: { id: oldDetail.product.id },
        });
        if (product) {
          product.stock += oldDetail.quantity;
          await this.ecommerceDetailRepository.manager.save(product);
        }
      }

      await this.ecommerceDetailRepository.remove(ecommerce.ecommerceDetail);
      const newDetailsToSave: ecommerceDetail[] = [];

      for (const detail of ecommerceDetail) {
        const product = await this.ecommerceDetailRepository.manager.findOne(Product, {
          where: { id: detail.productId },
          relations: ['images'], // ✅ Trae imágenes también
        });
        if (!product) throw new NotFoundException(`Producto con id ${detail.productId} no existe`);

        const unitPrice = product.price;
        const subTotal = unitPrice * detail.quantity;
        totalEcommerce += subTotal;

        const newDetail = this.ecommerceDetailRepository.create({
          ecommerce,
          product,
          quantity: detail.quantity,
          unitPrice,
          subTotal,
        });
        newDetailsToSave.push(newDetail);

        product.stock -= detail.quantity;
        await this.ecommerceDetailRepository.manager.save(product);
      }

      const savedDetails = await this.ecommerceDetailRepository.save(newDetailsToSave);
      ecommerce.ecommerceDetail = savedDetails;
      ecommerce.total = totalEcommerce;
    }

    return await this.ecommerceRepository.save(ecommerce);
  }

  async remove(id: string) {
    const ecommerce = await this.findOne(id);
    await this.ecommerceRepository.update(id, { status: 'Rechazado' });
    return { message: `Ecommerce (${ecommerce.client.firstName}) fue rechazado correctamente` };
  }

  async findByClient(clientId: string): Promise<Ecommerce[]> {
    const client = await this.clientRepository.findOne({
      where: { id: clientId },
      relations: [
        'ecommerces',
        'ecommerces.ecommerceDetail',
        'ecommerces.ecommerceDetail.product',
        'ecommerces.ecommerceDetail.product.images', // ✅ Corrige 'prodcut' → 'product' y añade imágenes
      ],
    });
    return client?.ecommerce || [];
  }
}
