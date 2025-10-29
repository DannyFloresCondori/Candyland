import { Product } from "src/products/entities/product.entity";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('categories')
export class Category {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 60, unique: true, nullable: false })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ length: 250, unique: true })
    slug: string;

    @Column({ type: 'text', nullable: true, name: 'image_url' })
    imageUrl?: string;

    @Column({ default: true, name: 'is_active' })
    isActive: boolean;

    @OneToMany(() => Product, (product) => product.category)
    products: Product[];

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
