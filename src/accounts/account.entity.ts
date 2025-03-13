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

@Entity("accounts")

export class Account {

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

    @Column()
    name: string

    @Column({ nullable: true })
    bankName: string

    @Column({ nullable: true })
    bankBranchName: string

    @Column({ nullable: true })
    bankAccountHolderName: string

    @Column({ nullable: true })
    bankAccountNumber: string

    @Column({ default: 0 })
    balance: number
    
    @Column({ default: false })
    deleted: boolean

}