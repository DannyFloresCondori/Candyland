import { Ecommerce } from "src/ecommerce/entities/ecommerce.entity";
import { Order } from "src/orders/entities/order.entity";
import { Role } from "src/roles/entities/role.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('users')
export class User {
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

    @Column({ length: 20, name: 'document_number' })
    documentNumber: string;

    @Column({ length: 20, nullable: true })
    phone?: string;

    @Column({ length: 200 })
    address: string;

    @Column({ default: false, name: 'is_email_verified' })
    isEmailVerified: boolean;

    @Column({ default: true, name: 'is_active' })
    isActive: boolean;

    @ManyToOne(() => Role, (role) => role.users, { cascade: true, onDelete: 'SET NULL' })
    role: Role;

    @OneToMany(()=> Order, (order)=> order.users, {eager: true})
    orders:Order[];

    @OneToMany(() => Ecommerce, (ecommerce) => ecommerce.users, { eager: true})
    ecommerce: Ecommerce[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updateD_at' })
    updatedAt: Date;
}
