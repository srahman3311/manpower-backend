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
import { User } from "src/users/entities/user.entity";
import { Account } from "src/accounts/account.entity";

@Entity("transactions")
export class Transaction {

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
    description: string

    @Column({ nullable: true })
    debitedFromAccountId: number

    @ManyToOne(() => Account, { nullable: true }) 
    @JoinColumn({ name: "debitedFromAccountId" }) 
    debitedFromAccount: Account | null

    @Column({ nullable: true })
    creditedToAccountId: number

    @ManyToOne(() => Account, { nullable: true }) 
    @JoinColumn({ name: "creditedToAccountId" }) 
    creditedToAccount: Account | null

    @Column({ nullable: true })
    debitedFromUserId: number

    @ManyToOne(() => User, { nullable: true }) 
    @JoinColumn({ name: "debitedFromUserId" }) 
    debitedFromUser: User | null

    @Column({ nullable: true })
    creditedToUserId: number

    @ManyToOne(() => User, { nullable: true }) 
    @JoinColumn({ name: "creditedToUserId" }) 
    creditedToUser: User | null

    @Column()
    userId: number

    @ManyToOne(() => User) 
    @JoinColumn({ name: "userId" }) 
    user: User

    @Column({ default: 0 })
    amount: number

    @Column({ default: false })
    deleted: boolean

}
