import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "src/products/entities/product.entity";
import { Ecommerce } from "./ecommerce.entity";

@Entity('ecommerce-detail')
export class ecommerceDetail {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    //orderId
    @ManyToOne(() => Ecommerce, (ecommerce) => ecommerce.ecommerceDetail, { onDelete: 'CASCADE' })
    ecommerce: Ecommerce;

    //productId
    @ManyToOne(() => Product, (prodcuts) => prodcuts.orderDetail, { onDelete: 'SET NULL' })
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