import { Category } from "src/categories/entities/category.entity";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { orderDetail } from "src/orders/entities/orderDetail.entity";

@Entity('products')
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100, unique: true })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ length: 250, unique: true })
    slug: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'int', default: 0 })
    stock: number;

    @Column({ default: true, name: 'is_available' })
    isAvailable: boolean;

    @Column({ default: true, name: 'is_active' })
    isActive: boolean;

    @ManyToOne(() => Category, (category) => category.products, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @OneToMany(() => ProductImage, (image) => image.product, { cascade: true, eager: true })
    images?: ProductImage[]

    @OneToMany(() => orderDetail, (orderDetail) => orderDetail.product, { eager: true })
    orderDetail: orderDetail[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @BeforeInsert()
    @BeforeUpdate()
    generateSlug() {
        if (!this.slug) {
            this.slug = this.name;
        }

        this.slug = this.slug
            .toLowerCase()
            .trim()
            .replace(/[áàäâã]/g, 'a')
            .replace(/[éèëê]/g, 'e')
            .replace(/[íìïî]/g, 'i')
            .replace(/[óòöôõ]/g, 'o')
            .replace(/[úùüû]/g, 'u')
            .replace(/[ñ]/g, 'n')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

}
