import { User } from 'src/users/entities/user.entity';
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, } from 'typeorm';
import { orderDetail } from './orderDetail.entity';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50 })
    nameClient: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    nameCompany?: string;

    @Column({ type: 'varchar', length: 25, default: 'Pendiente' })
    status?: string; //Pendiente, vendido, rechazado

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        transformer: {
            to: (value: number) => value,
            from: (value: string): number => parseFloat(value),
        },
    })
    total?: number;

    //userId
    @ManyToOne(() => User, (user) => user.orders, { onDelete: 'SET NULL' })
    users: User;

    //orderDetailId
    @OneToMany(() => orderDetail, (orderDetail) => orderDetail.order, { eager: true })
    orderDetails: orderDetail[];


    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

