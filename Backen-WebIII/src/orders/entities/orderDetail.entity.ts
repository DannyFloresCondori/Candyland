import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";
import { Product } from "src/products/entities/product.entity";

@Entity('order-detail')
export class orderDetail {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    //orderId
    @ManyToOne(() => Order, (order) => order.orderDetails, { onDelete: 'CASCADE' })
    order: Order;

    //productId
    @ManyToOne(() => Product, (prodcuts) => prodcuts.orderDetail, { onDelete: 'CASCADE' })
    product: Product;

    @Column({ type: 'int' })
    quantity: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        transformer: {
            to: (value: number) => value, // se guarda tal cual
            from: (value: string): number => parseFloat(value), // lo convierte al leer
        },
    })
    unitPrice: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        transformer: {
            to: (value: number) => value,
            from: (value: string): number => parseFloat(value),
        },
    })
    subTotal: number;
}