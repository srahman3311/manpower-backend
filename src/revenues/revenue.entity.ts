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
import { Job } from "src/jobs/job.entity";
import { Passenger } from "src/passengers/entities/passenger.entity";

@Entity("revenues")
export class Revenue {

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
    jobId: number

    @ManyToOne(() => Job, { nullable: true }) 
    @JoinColumn({ name: "jobId" }) 
    job: Job | null

    @Column({ nullable: true })
    passengerId: number

    @ManyToOne(() => Passenger, { nullable: true }) 
    @JoinColumn({ name: "passengerId" }) 
    passenger: Passenger | null

    @Column({ default: 0 })
    amount: number

    @Column({ default: false })
    approvedByTenant: boolean

    @Column({ default: false })
    approvedByAdmin: boolean

    @Column({ default: false })
    approvedByDirector: boolean

    @Column({ default: false })
    approvedByManagingDirector: boolean

    @Column({ default: false })
    deleted: boolean

}
