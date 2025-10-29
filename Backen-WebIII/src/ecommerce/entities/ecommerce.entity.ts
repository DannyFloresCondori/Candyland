import { Client } from "src/clients/entities/client.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ecommerceDetail } from "./ecommerceDetail.entity";

@Entity('ecommerce')
export class Ecommerce {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    //idClient
    @ManyToOne(() => Client, (Client) => Client.ecommerce, {onDelete: 'SET NULL'})
    client: Client;

    @Column({ type: 'varchar', length: 20 })
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
    @ManyToOne(() => User, (user) => user.ecommerce, { onDelete: 'SET NULL' })
    users: User;

    //ecommerceDetailId
    @OneToMany(() => ecommerceDetail, (ecommerceDetail)=> ecommerceDetail.ecommerce, { eager: true, cascade: true})
    ecommerceDetail: ecommerceDetail[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
