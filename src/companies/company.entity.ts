import { 
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Column, 
    ManyToOne,
    JoinColumn
} from "typeorm";
import { Tenant } from "src/tenants/tenant.entity";
import { Address } from "src/global/addresses/address.entity";

@Entity("companies")

export class Company {

    @Column()
    tenantId: number

    @ManyToOne(() => Tenant) 
    @JoinColumn({ name: "tenantId" }) 
    tenant: Tenant

    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date

    @Column({ unique: true })
    name: string

    // categories will be like construction and others
    @Column({ nullable: true })
    category: string

    @Column({ nullable: false, unique: true })
    email: string

    @Column({ nullable: true })
    phone: string

    @Column()
    addressId: number
    
    @ManyToOne(() => Address, { nullable: true }) 
    @JoinColumn({ name: "addressId" }) 
    address: Address

    @Column({ default: false })
    isActive: boolean
    
    @Column({ default: false })
    deleted: boolean

}