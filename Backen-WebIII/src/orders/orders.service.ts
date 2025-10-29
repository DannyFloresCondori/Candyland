
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { orderDetail } from './entities/orderDetail.entity';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(orderDetail)
    private readonly orderDetailRepository: Repository<orderDetail>,
    // Si necesitas obtener usuario/producto, puedes inyectar los servicios:
    // private readonly usersService: UsersService,
    // private readonly productsService: ProductsService,
  ) { }

  async create(createOrderDto: CreateOrderDto) {
    const {
      nameClient,
      nameCompany,
      status = 'Pendiente',
      total,
      userId,
      orderDetails,
    } = createOrderDto;

    // 🔹 Crear la orden principal (sin detalles aún)
    const order = this.orderRepository.create({
      nameClient,
      nameCompany,
      status,
      total: 0, // se recalculará abajo
      users: { id: userId } as any, // relación por id
    });

    const savedOrder = await this.orderRepository.save(order);

    let totalOrder = 0;
    const detailsToSave: orderDetail[] = [];

    // 🔹 Crear detalles y calcular precios
    for (const detail of orderDetails) {
      // Buscar el producto desde el manager
      const product = await this.orderDetailRepository.manager.findOne(Product, {
        where: { id: detail.productId },
      });

      if (!product) {
        throw new NotFoundException(`El producto con id ${detail.productId} no existe`);
      }

      // 🔸 Verificar stock disponible
      if (product.stock < detail.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para el producto ${product.name}. Disponible: ${product.stock}`,
        );
      }

      // 🔸 Calcular precios
      const unitPrice = product.price;
      const subTotal = unitPrice * detail.quantity;
      totalOrder += subTotal;

      // 🔸 Crear detalle
      const orderDetail = this.orderDetailRepository.create({
        order: savedOrder,
        product,
        quantity: detail.quantity,
        unitPrice,
        subTotal,
      });

      detailsToSave.push(orderDetail);

      // 🔸 Actualizar stock del producto
      product.stock -= detail.quantity;
      await this.orderDetailRepository.manager.save(product);
    }

    // 🔹 Guardar detalles
    const savedDetails = await this.orderDetailRepository.save(detailsToSave);

    // 🔹 Actualizar total de la orden
    savedOrder.total = totalOrder;
    savedOrder.orderDetails = savedDetails;

    await this.orderRepository.save(savedOrder);

    // 🔹 Retornar con relaciones incluidas
    return await this.orderRepository.findOne({
      where: { id: savedOrder.id },
      relations: ['orderDetails', 'orderDetails.product', 'users'],
    });
  }


  async findAll() {
    return await this.orderRepository.find({
      where: [
        { status: 'Pendiente' },
        { status: 'Vendido' },
        { status: 'Rechazado' },
      ], relations: ['orderDetails', 'orderDetails.product', 'orderDetails.product.images'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne({
      where: [
        { id, status: 'Pendiente' },
        { id, status: 'Vendido' },
        { id, status: 'Rechazado' },
      ],
      relations: [
        'orderDetails',
        'orderDetails.product',
        'users',
      ],
    });
    if (!order) throw new NotFoundException(`Order with id ${id} not found`);
    return order;
  }

  // Actualizara la orden

  async update(id: string, updateOrderDto: Partial<UpdateOrderDto>) {
    // Buscar la orden existente
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderDetails', 'users'],
    });

    if (!order) {
      throw new NotFoundException(`La orden con id ${id} no existe`);
    }

    // Actualizar campos de la orden
    if (updateOrderDto.nameClient !== undefined) {
      order.nameClient = updateOrderDto.nameClient;
    }

    if (updateOrderDto.nameCompany !== undefined) {
      order.nameCompany = updateOrderDto.nameCompany;
    }

    if (updateOrderDto.status !== undefined) {
      order.status = updateOrderDto.status; // Aquí es donde pondrías "Vendido"
    }

    if (updateOrderDto.total !== undefined) {
      order.total = updateOrderDto.total;
    }

    // Opcional: actualizar detalles de la orden si vienen
    if (updateOrderDto.orderDetails) {
      // Podrías eliminarlos y crear nuevos, o actualizar existentes
      // Ejemplo simple: eliminar todos y crear los nuevos
      await this.orderDetailRepository.delete({ order: { id: order.id } });

      let totalOrder = 0;
      const detailsToSave: orderDetail[] = [];

      for (const detail of updateOrderDto.orderDetails) {
        const product = await this.orderDetailRepository.manager.findOne(Product, {
          where: { id: detail.productId }
        });

        if (!product) throw new NotFoundException(`Producto con id ${detail.productId} no existe`);

        const unitPrice = product.price;
        const subTotal = unitPrice * detail.quantity;
        totalOrder += subTotal;

        const orderDetail = this.orderDetailRepository.create({
          order,
          product,
          quantity: detail.quantity,
          unitPrice,
          subTotal,
        });

        detailsToSave.push(orderDetail);

        product.stock -= detail.quantity;
        await this.orderDetailRepository.manager.save(product);
      }

      const savedDetails = await this.orderDetailRepository.save(detailsToSave);
      order.orderDetails = savedDetails;
      order.total = totalOrder;
    }

    // Guardar cambios
    return await this.orderRepository.save(order);
  }


  async remove(id: string) {
    const order = await this.findOne(id);
    await this.orderRepository.update(id, { status: 'Rechazado' })

    return { message: `order (${order.nameClient}) fue Rechazado conrrectamente` };
  }
}
