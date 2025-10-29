import { Ecommerce } from "src/ecommerce/entities/ecommerce.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
// import { Order } from "src/orders/entities/order.entity";  // Ajustar al path correcto

@Entity('clients')
export class Client {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100, unique: true })
    email: string;

    @Column({ length: 250, select: false })
    password: string;

    @Column({ length: 100, name: 'first_name' })
    firstName: string;

    @Column({ length: 100, name: 'last_name' })
    lastName: string;

    @Column({ length: 20, nullable: true })
    phone?: string;

    @Column({  default: 'client' })
    role?: string;

    @Column({ length: 200 })
    address: string;

    @Column({ length: 100, nullable: true, name: 'company_name' })
    companyName?: string; // Si el cliente tiene una empresa asociada

    @Column({ default: true, name: 'is_active' })
    isActive?: boolean;

    @Column({ default: false, name: 'is_email_verified' })
    isEmailVerified: boolean;

    // Relación con pedidos, un cliente puede tener muchos pedidos
    @OneToMany(() => Ecommerce, (ecommerce) => ecommerce.client)
    ecommerce: Ecommerce[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
