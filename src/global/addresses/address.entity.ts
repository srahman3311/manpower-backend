import { 
    Column, 
    Entity, 
    PrimaryGeneratedColumn, 
    CreateDateColumn, 
    UpdateDateColumn 
} from "typeorm";

@Entity("addresses")

export class Address {

    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date

    @Column({ default: null })
    line1: string

    @Column({ default: null })
    line2: string

    @Column({ default: null })
    postalCode: string 

    @Column({ default: null })
    city: string

    @Column({ default: null })
    state: string

    @Column({ default: null })
    country: string

    @Column({ default: false })
    deleted: boolean

}